import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { ExamQuestion } from '../../types';
import { useSaveGrammarTrap } from '../use-grammar-traps';
import { GRAMMAR_UI_TEXT } from '../../constants';
import type {
  AssessmentAnswer,
  ExamAttemptResult,
  RecoveryData,
  AssessmentSessionState,
  AssessmentSessionActions,
} from '../../types/assessment-engine.types';

interface UseAssessmentSessionParams {
  questions: ExamQuestion[];
  timeLimit: number;
  examType: string;
  examTitle: string;
  onFinish: (correctCount: number, totalCount: number) => Promise<unknown>;
}

interface UseAssessmentSessionReturn {
  state: AssessmentSessionState;
  actions: AssessmentSessionActions;
}

export const useAssessmentSession = ({
  questions,
  timeLimit,
  examType,
  examTitle,
  onFinish,
}: UseAssessmentSessionParams): UseAssessmentSessionReturn => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const saveTrapMutation = useSaveGrammarTrap();
  const [savedTrapIds, setSavedTrapIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<ExamAttemptResult | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [selectedErrorWord, setSelectedErrorWord] = useState<string | null>(null);
  const [correctedText, setCorrectedText] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentQuestion = questions[currentIdx] || questions[0];

  const sessionKey = `sne_session_${examType}_${examTitle.replace(/\s+/g, '_')}`;
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);

  const submitExam = useCallback(async () => {
    setIsSubmitting(true);
    let correctCount = 0;
    questions.forEach((q) => {
      const saved = answers[q.id];
      if (!saved) return;
      if (q.type === 'MULTIPLE_CHOICE') {
        if (saved.userAnswer === q.answer) correctCount++;
      } else if (q.type === 'SENTENCE_BUILDER') {
        if (saved.userAnswer?.toLowerCase() === q.answer.toLowerCase()) correctCount++;
      } else if (q.type === 'ERROR_SPOTLIGHT') {
        const isTargetCorrect = saved.incorrectWord?.toLowerCase() === q.incorrectWord?.toLowerCase();
        const isCorrectionCorrect = saved.correctedText?.trim().toLowerCase() === q.correctWord?.toLowerCase();
        if (isTargetCorrect && isCorrectionCorrect) correctCount++;
      }
    });
    try {
      const res = await onFinish(correctCount, questions.length);
      setExamResult(res as ExamAttemptResult);
      setIsCompleted(true);
      localStorage.removeItem(sessionKey);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, questions, onFinish, sessionKey]);

  useEffect(() => {
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          (Object.keys(parsed.answers || {}).length > 0 ||
            parsed.flaggedIds?.length > 0 ||
            parsed.currentIdx > 0) &&
          parsed.timeLeft > 0
        ) {
          setRecoveryData(parsed);
          setShowRecoveryModal(true);
        }
      } catch (err) {
        console.error('Lỗi phân tích cú pháp phiên lưu trữ:', err);
      }
    }
  }, [sessionKey]);

  const handleRecover = useCallback(() => {
    if (recoveryData) {
      setAnswers(recoveryData.answers || {});
      setFlaggedIds(recoveryData.flaggedIds || []);
      setTimeLeft(recoveryData.timeLeft ?? timeLimit);
      setCurrentIdx(recoveryData.currentIdx ?? 0);
      toast.success(GRAMMAR_UI_TEXT.assessmentEngine.toastRecoverSuccess);
    }
    setShowRecoveryModal(false);
  }, [recoveryData, timeLimit]);

  const handleDiscard = useCallback(() => {
    localStorage.removeItem(sessionKey);
    setShowRecoveryModal(false);
    toast.info(GRAMMAR_UI_TEXT.assessmentEngine.toastDiscardSuccess);
  }, [sessionKey]);

  useEffect(() => {
    if (!isCompleted && !showRecoveryModal && timeLeft > 0 &&
      (Object.keys(answers).length > 0 || flaggedIds.length > 0 || currentIdx > 0)) {
      localStorage.setItem(sessionKey, JSON.stringify({ answers, flaggedIds, timeLeft, currentIdx }));
    }
  }, [answers, flaggedIds, timeLeft, currentIdx, isCompleted, showRecoveryModal, sessionKey]);

  useEffect(() => {
    if (isCompleted || showRecoveryModal) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, showRecoveryModal, questions]);

  useEffect(() => {
    if (!currentQuestion) return;
    const saved = answers[currentQuestion.id];
    setSelectedOpt(null);
    setSelectedWords([]);
    setSelectedErrorWord(null);
    setCorrectedText('');
    if (saved) {
      if (currentQuestion.type === 'MULTIPLE_CHOICE') setSelectedOpt(saved.userAnswer || null);
      else if (currentQuestion.type === 'SENTENCE_BUILDER') setSelectedWords(saved.words || []);
      else if (currentQuestion.type === 'ERROR_SPOTLIGHT') {
        setSelectedErrorWord(saved.incorrectWord || null);
        setCorrectedText(saved.correctedText || '');
      }
    }
  }, [currentIdx, currentQuestion, answers]);

  const toggleFlag = useCallback((qId: string) => {
    setFlaggedIds((prev) => prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]);
  }, []);

  const handleSelectOption = useCallback((opt: string) => {
    setSelectedOpt(opt);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { userAnswer: opt, isAnswered: true } }));
  }, [currentQuestion.id]);

  const handleWordClick = useCallback((word: string) => {
    const updated = [...selectedWords, word];
    setSelectedWords(updated);
    const rawAnswer = updated.join(' ').replace(/\s+/g, ' ').trim().replace(/\s+([.,!?;])/g, '$1');
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { userAnswer: rawAnswer, words: updated, isAnswered: true } }));
  }, [selectedWords, currentQuestion.id]);

  const handleRemoveWord = useCallback((wordIndex: number) => {
    const updated = selectedWords.filter((_, idx) => idx !== wordIndex);
    setSelectedWords(updated);
    const rawAnswer = updated.join(' ').replace(/\s+/g, ' ').trim().replace(/\s+([.,!?;])/g, '$1');
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: { userAnswer: rawAnswer, words: updated, isAnswered: updated.length > 0 } }));
  }, [selectedWords, currentQuestion.id]);

  const handleClearWords = useCallback(() => {
    setSelectedWords([]);
    setAnswers((prev) => { const copy = { ...prev }; delete copy[currentQuestion.id]; return copy; });
  }, [currentQuestion.id]);

  const updateErrorSpotlightAnswer = useCallback((incWord: string, corrWord: string) => {
    setAnswers((prev) => ({
      ...prev, [currentQuestion.id]: { userAnswer: corrWord.trim(), incorrectWord: incWord, correctedText: corrWord, isAnswered: incWord !== null && corrWord.trim() !== '' },
    }));
  }, [currentQuestion.id]);

  const handleSelectErrorWord = useCallback((word: string) => {
    const cleanWord = word.replace(/[.,!?;]/g, '');
    setSelectedErrorWord(cleanWord);
    updateErrorSpotlightAnswer(cleanWord, correctedText);
  }, [correctedText, updateErrorSpotlightAnswer]);

  const handleCorrectionChange = useCallback((text: string) => {
    setCorrectedText(text);
    if (selectedErrorWord) updateErrorSpotlightAnswer(selectedErrorWord, text);
  }, [selectedErrorWord, updateErrorSpotlightAnswer]);

  const handleSaveTrap = useCallback(async (q: ExamQuestion, userAnswer: string) => {
    try {
      await saveTrapMutation.mutateAsync({
        questionId: q.id,
        questionText: q.type === 'ERROR_SPOTLIGHT' ? q.sentence || q.text : q.text,
        questionType: q.type || 'MULTIPLE_CHOICE',
        questionData: { options: q.options || [], words: q.words || [], sentence: q.sentence || '', incorrectWord: q.incorrectWord || '', correctWord: q.correctWord || '' },
        category: q.category || 'syntax',
        userAnswer: userAnswer || GRAMMAR_UI_TEXT.assessmentEngine.defaultWrongAnswerText,
        correctAnswer: q.type === 'ERROR_SPOTLIGHT' ? `${q.incorrectWord} -> ${q.correctWord}` : q.answer,
        explanation: q.explanation,
      });
      setSavedTrapIds((prev) => [...prev, q.id]);
      toast.success(GRAMMAR_UI_TEXT.assessmentEngine.toastSaveSuccess);
    } catch {
      toast.error(GRAMMAR_UI_TEXT.assessmentEngine.toastSaveError);
    }
  }, [saveTrapMutation]);

  const retryExam = useCallback(() => {
    setIsCompleted(false);
    setTimeLeft(timeLimit);
    setAnswers({});
    setFlaggedIds([]);
    setCurrentIdx(0);
  }, [timeLimit]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  const progressPercent = (currentIdx / questions.length) * 100;

  return {
    state: {
      currentIdx, answers, flaggedIds, timeLeft, isCompleted, isSubmitting,
      examResult, selectedOpt, selectedWords, selectedErrorWord, correctedText,
      savedTrapIds, showRecoveryModal, recoveryData, currentQuestion,
      formattedTime, progressPercent,
    },
    actions: {
      setCurrentIdx, toggleFlag, handleSelectOption, handleWordClick,
      handleRemoveWord, handleClearWords, handleSelectErrorWord,
      handleCorrectionChange, submitExam, handleRecover, handleDiscard,
      handleSaveTrap, retryExam,
    },
  };
};
