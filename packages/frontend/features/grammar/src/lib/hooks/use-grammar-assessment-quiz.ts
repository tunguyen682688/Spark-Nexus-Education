import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuestionBank } from './quiz/use-question-bank';
import { useQuizSession, useQuizAutosave } from './quiz/use-quiz-session';
import { useQuizTimer } from './quiz/use-quiz-timer';
import { useQuizHandlers } from './quiz/use-quiz-handlers';
import { useSaveGrammarTrap } from './use-grammar-traps';
import { toast } from 'sonner';
import type { ExamQuestion } from '../types';

interface UseGrammarAssessmentQuizProps {
  lessonId: string;
}

export function useGrammarAssessmentQuiz({ lessonId }: UseGrammarAssessmentQuizProps) {
  const { questions, isLoading } = useQuestionBank({ lessonId });
  const saveTrapMutation = useSaveGrammarTrap();

  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [savedTrapIds, setSavedTrapIds] = useState<string[]>([]);

  useEffect(() => {
    if (questions.length > 0 && !hasInitialized) {
      setActiveQuestions(questions);
      setHasInitialized(true);
    }
  }, [questions, hasInitialized]);

  const session = useQuizSession({
    lessonId,
    isCompleted,
    showRecoveryModal: false,
    activeQuestionIds: activeQuestions.map((q) => q.id),
    questions,
  });

  const handleComplete = useCallback(() => setIsCompleted(true), []);

  const { timeLeft, setTimeLeft } = useQuizTimer({
    isCompleted,
    isPaused: session.showRecoveryModal,
    initialTime: activeQuestions.length * 60 || 300,
    onComplete: handleComplete,
  });

  const currentQuestion = activeQuestions[currentIdx] || questions[0];

  const handlers = useQuizHandlers({
    currentQuestion,
    isAnswered,
  });

  useQuizAutosave({
    lessonId,
    isCompleted,
    showRecoveryModal: session.showRecoveryModal,
    state: {
      currentIdx,
      score,
      wrongQuestionIds,
      timeLeft,
      isAnswered,
      isCorrect: handlers.isCorrect,
      selectedOpt: handlers.selectedOpt,
      selectedWords: handlers.selectedWords,
      selectedErrorWord: handlers.selectedErrorWord,
      correctedText: handlers.correctedText,
      activeQuestionsIds: activeQuestions.map((q) => q.id),
    },
  });

  const updateScore = useCallback((correct: boolean) => {
    if (correct) {
      setScore((prev) => prev + 1);
    }
  }, []);

  const handleAnswerAndTrack = useCallback(
    (correct: boolean, question: ExamQuestion) => {
      updateScore(correct);
      if (!correct) {
        setWrongQuestionIds((prev) => [...prev, question.id]);
      }
      setIsAnswered(true);
    },
    [updateScore]
  );

  const handleSelectOption = useCallback(
    (opt: string) => {
      const correct = handlers.handleSelectOption(opt);
      if (currentQuestion) {
        handleAnswerAndTrack(correct, currentQuestion);
      }
    },
    [handlers, currentQuestion, handleAnswerAndTrack]
  );

  const handleCheckSentenceBuilder = useCallback(() => {
    const correct = handlers.handleCheckSentenceBuilder();
    if (currentQuestion) {
      handleAnswerAndTrack(correct, currentQuestion);
    }
  }, [handlers, currentQuestion, handleAnswerAndTrack]);

  const handleCheckErrorSpotlight = useCallback(() => {
    const correct = handlers.handleCheckErrorSpotlight();
    if (currentQuestion) {
      handleAnswerAndTrack(correct, currentQuestion);
    }
  }, [handlers, currentQuestion, handleAnswerAndTrack]);

  const handleNext = useCallback(() => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setIsAnswered(false);
      handlers.resetAnswer();
    } else {
      setIsCompleted(true);
    }
  }, [currentIdx, activeQuestions.length, handlers]);

  const resetQuiz = useCallback(() => {
    setActiveQuestions(questions);
    setCurrentIdx(0);
    setScore(0);
    setIsCompleted(false);
    setWrongQuestionIds([]);
    setIsAnswered(false);
    setTimeLeft(questions.length * 60);
    handlers.resetAnswer();
  }, [questions, handlers, setTimeLeft]);

  const retryMistakes = useCallback(() => {
    const mistakes = questions.filter((q) => wrongQuestionIds.includes(q.id));
    setActiveQuestions(mistakes);
    setCurrentIdx(0);
    setScore(0);
    setIsCompleted(false);
    setWrongQuestionIds([]);
    setIsAnswered(false);
    setTimeLeft(mistakes.length * 60);
    handlers.resetAnswer();
  }, [questions, wrongQuestionIds, handlers, setTimeLeft]);

  const handleSaveTrap = useCallback(
    async (q: ExamQuestion) => {
      try {
        await saveTrapMutation.mutateAsync({
          questionId: q.id,
          questionText: q.type === 'ERROR_SPOTLIGHT' ? q.sentence || q.text : q.text,
          questionType: q.type || 'MULTIPLE_CHOICE',
          questionData: {
            options: q.options || [],
            words: q.words || [],
            sentence: q.sentence || '',
            incorrectWord: q.incorrectWord || '',
            correctWord: q.correctWord || '',
          },
          category: q.category || 'syntax',
          userAnswer:
            q.type === 'ERROR_SPOTLIGHT'
              ? `${q.incorrectWord} -> ${q.correctWord}`
              : 'Đã trả lời chưa chính xác',
          correctAnswer: q.answer,
          explanation: q.explanation,
        });
        setSavedTrapIds((prev) => [...prev, q.id]);
        toast.success('Đã lưu lỗi sai vào Sổ Tay Bẫy Ngữ Pháp của bạn!');
      } catch {
        toast.error('Có lỗi xảy ra khi lưu bẫy ngữ pháp.');
      }
    },
    [saveTrapMutation]
  );

  return {
    isLoading,
    questions,
    activeQuestions,
    currentIdx,
    currentQuestion,
    selectedOpt: handlers.selectedOpt,
    selectedWords: handlers.selectedWords,
    selectedErrorWord: handlers.selectedErrorWord,
    correctedText: handlers.correctedText,
    isAnswered,
    isCorrect: handlers.isCorrect,
    score,
    isCompleted,
    wrongQuestionIds,
    timeLeft,
    showRecoveryModal: session.showRecoveryModal,
    recoveryData: session.recoveryData,
    savedTrapIds,
    setCorrectedText: handlers.setCorrectedText,
    handleSelectOption,
    handleWordClick: handlers.handleWordClick,
    handleRemoveWord: handlers.handleRemoveWord,
    handleClearWords: handlers.handleClearWords,
    handleCheckSentenceBuilder,
    handleSelectErrorWord: handlers.handleSelectErrorWord,
    handleCheckErrorSpotlight,
    handleNext,
    resetQuiz,
    retryMistakes,
    handleSaveTrap,
    handleRecover: () =>
      session.handleRecover(() => {
        if (recoveryData?.activeQuestionsIds && Array.isArray(recoveryData.activeQuestionsIds)) {
          const mapped = recoveryData.activeQuestionsIds
            .map((id) => questions.find((q) => q.id === id))
            .filter(Boolean) as ExamQuestion[];
          if (mapped.length > 0) setActiveQuestions(mapped);
        } else {
          setActiveQuestions(questions);
        }
        setCurrentIdx(recoveryData?.currentIdx ?? 0);
        setScore(recoveryData?.score ?? 0);
        setWrongQuestionIds(recoveryData?.wrongQuestionIds || []);
        setTimeLeft(recoveryData?.timeLeft ?? 300);
        setIsAnswered(recoveryData?.isAnswered ?? false);
      }),
    handleDiscard: () =>
      session.handleDiscard(() => {
        setActiveQuestions(questions);
        toast.info('Bắt đầu làm bài quiz mới!');
      }),
  };
}
