import { useState, useEffect, useRef, useMemo } from 'react';
import { useGrammarLesson } from './use-grammar-lessons';
import { useSaveGrammarTrap } from './use-grammar-traps';
import { useCrowdsourcedQuizzes } from './use-grammar-community';
import { toast } from 'sonner';
import type { ExamQuestion } from '../types';

export const MOCK_ASSESSMENT_QUESTIONS: ExamQuestion[] = [
  {
    id: 'as-1',
    type: 'MULTIPLE_CHOICE',
    text: 'By the time the teacher arrived, the students _____ the grammar notes.',
    options: ['copied', 'have copied', 'had copied', 'were copying'],
    answer: 'had copied',
    explanation:
      'Hành động học sinh chép xong bài xảy ra trước hành động giáo viên đến (Quá khứ đơn), nên vế trước dùng Quá khứ hoàn thành.',
    category: 'tenses',
  },
  {
    id: 'as-2',
    type: 'SENTENCE_BUILDER',
    text: 'Hãy click chọn các từ để sắp xếp thành câu điều kiện loại 2 hoàn chỉnh:',
    words: [
      'were',
      'If',
      'rich,',
      'I',
      'would',
      'buy',
      'a',
      'new',
      'car.',
      'I',
    ],
    answer: 'If I were rich, I would buy a new car.',
    explanation:
      'Câu điều kiện loại 2 diễn tả một giả định không có thật ở hiện tại. Cấu trúc: If + S + V2/ed (were), S + would + V-inf.',
    category: 'syntax',
  },
  {
    id: 'as-3',
    type: 'ERROR_SPOTLIGHT',
    text: 'Tìm từ viết sai ngữ pháp trong câu dưới đây (click chọn từ sai) và nhập từ sửa lại đúng:',
    sentence: 'He has been studying English since five years now.',
    incorrectWord: 'since',
    correctWord: 'for',
    answer: 'for',
    explanation:
      'Khoảng thời gian (five years) đi kèm với giới từ "for", còn mốc thời gian mới đi kèm với "since".',
    category: 'morphology',
  },
  {
    id: 'as-4',
    type: 'MULTIPLE_CHOICE',
    text: 'It is vital that he _____ the structure formula by heart.',
    options: ['learn', 'learns', 'learned', 'should learns'],
    answer: 'learn',
    explanation:
      'Cấu trúc giả định với tính từ chỉ tầm quan trọng: It is + vital/important + that + S + V (bare infinitive).',
    category: 'modality',
  },
];

interface UseGrammarAssessmentQuizProps {
  lessonId: string;
}

interface QuizRecoveryData {
  currentIdx?: number;
  score?: number;
  wrongQuestionIds?: string[];
  timeLeft?: number;
  isAnswered?: boolean;
  isCorrect?: boolean | null;
  selectedOpt?: string | null;
  selectedWords?: string[];
  selectedErrorWord?: string | null;
  correctedText?: string;
  activeQuestionsIds?: string[];
}

export function useGrammarAssessmentQuiz({ lessonId }: UseGrammarAssessmentQuizProps) {
  const { data: lesson, isLoading: isLessonLoading } = useGrammarLesson(lessonId);
  const { data: crowdsourcedQuizzes, isLoading: isCrowdsourcedLoading } = useCrowdsourcedQuizzes(lessonId);
  const saveTrapMutation = useSaveGrammarTrap();

  // Combine database questions and fallback to mock if none exist
  const questions = useMemo(() => {
    const list: ExamQuestion[] = [];

    // 1. Map lesson blocks of type 'quiz'
    if (lesson?.blocks && Array.isArray(lesson.blocks)) {
      lesson.blocks.forEach((block: any) => {
        if (block.type === 'quiz') {
          list.push({
            id: block.id,
            text: block.question || '',
            type: 'MULTIPLE_CHOICE',
            options: block.options || [],
            answer: block.answer || '',
            explanation: block.explanation || 'Hãy chọn đáp án đúng nhất.',
            category: 'syntax',
          });
        }
      });
    }

    // 2. Map approved crowdsourced quizzes
    if (crowdsourcedQuizzes && Array.isArray(crowdsourcedQuizzes)) {
      crowdsourcedQuizzes
        .filter((quiz) => quiz.status === 'APPROVED')
        .forEach((quiz) => {
          const type = quiz.questionType;
          const data = quiz.questionData;
          list.push({
            id: quiz.id,
            type: type,
            text: type === 'MULTIPLE_CHOICE'
              ? (data.text || data.question || 'Hãy chọn đáp án đúng nhất:')
              : type === 'SENTENCE_BUILDER'
              ? 'Hãy click chọn các từ để sắp xếp thành câu hoàn chỉnh:'
              : 'Tìm từ viết sai ngữ pháp trong câu dưới đây (click chọn từ sai) và nhập từ sửa lại đúng:',
            options: data.options || [],
            answer: data.answer || '',
            explanation: quiz.explanation || 'Đáp án do cộng đồng đóng góp.',
            category: 'syntax',
            words: data.words || [],
            sentence: data.sentence || '',
            incorrectWord: data.incorrectWord || '',
            correctWord: data.correctWord || '',
          });
        });
    }

    if (list.length === 0) {
      return MOCK_ASSESSMENT_QUESTIONS;
    }

    return list;
  }, [lesson, crowdsourcedQuizzes]);

  // States
  const [activeQuestions, setActiveQuestions] = useState<ExamQuestion[]>([]);
  const [hasInitializedQuestions, setHasInitializedQuestions] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [savedTrapIds, setSavedTrapIds] = useState<string[]>([]);

  // Trắc nghiệm
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  // Sentence Builder
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Error Spotlight
  const [selectedErrorWord, setSelectedErrorWord] = useState<string | null>(null);
  const [correctedText, setCorrectedText] = useState('');

  // Trạng thái chung
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes standard

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionKey = `sne_quiz_session_${lessonId}`;

  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<QuizRecoveryData | null>(null);

  // Initialize activeQuestions once questions load
  useEffect(() => {
    if (questions.length > 0 && !hasInitializedQuestions) {
      setActiveQuestions(questions);
      setHasInitializedQuestions(true);
      setTimeLeft(questions.length * 60); // 1 minute per question
    }
  }, [questions, hasInitializedQuestions]);

  // Check for saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QuizRecoveryData;
        if (
          parsed &&
          parsed.timeLeft &&
          parsed.timeLeft > 0 &&
          ((parsed.currentIdx && parsed.currentIdx > 0) || (parsed.score && parsed.score > 0) || parsed.isAnswered)
        ) {
          setRecoveryData(parsed);
          setShowRecoveryModal(true);
        }
      } catch (err) {
        console.error('Lỗi phân tích cú pháp phiên lưu trữ:', err);
      }
    }
  }, [sessionKey]);

  // Recover session handler
  const handleRecover = () => {
    if (recoveryData) {
      if (recoveryData.activeQuestionsIds && recoveryData.activeQuestionsIds.length > 0) {
        const mapped = recoveryData.activeQuestionsIds
          .map((id) => questions.find((q) => q.id === id))
          .filter(Boolean) as ExamQuestion[];
        if (mapped.length > 0) {
          setActiveQuestions(mapped);
        }
      } else {
        setActiveQuestions(questions);
      }

      setCurrentIdx(recoveryData.currentIdx ?? 0);
      setScore(recoveryData.score ?? 0);
      setWrongQuestionIds(recoveryData.wrongQuestionIds || []);
      setTimeLeft(recoveryData.timeLeft ?? 300);
      setIsAnswered(recoveryData.isAnswered ?? false);
      setIsCorrect(recoveryData.isCorrect ?? null);
      setSelectedOpt(recoveryData.selectedOpt ?? null);
      setSelectedWords(recoveryData.selectedWords || []);
      setSelectedErrorWord(recoveryData.selectedErrorWord ?? null);
      setCorrectedText(recoveryData.correctedText ?? '');
      toast.success('Đã khôi phục phiên làm bài quiz thành công!');
    }
    setShowRecoveryModal(false);
  };

  // Discard session handler
  const handleDiscard = () => {
    localStorage.removeItem(sessionKey);
    setShowRecoveryModal(false);
    setActiveQuestions(questions);
    toast.info('Bắt đầu làm bài quiz mới!');
  };

  // Autosave current state to localStorage
  useEffect(() => {
    if (
      !isCompleted &&
      !showRecoveryModal &&
      timeLeft > 0 &&
      (currentIdx > 0 || isAnswered || score > 0) &&
      activeQuestions.length > 0
    ) {
      localStorage.setItem(
        sessionKey,
        JSON.stringify({
          currentIdx,
          score,
          wrongQuestionIds,
          timeLeft,
          isAnswered,
          isCorrect,
          selectedOpt,
          selectedWords,
          selectedErrorWord,
          correctedText,
          activeQuestionsIds: activeQuestions.map((q) => q.id),
        })
      );
    }
  }, [
    currentIdx,
    score,
    wrongQuestionIds,
    timeLeft,
    isAnswered,
    isCorrect,
    selectedOpt,
    selectedWords,
    selectedErrorWord,
    correctedText,
    isCompleted,
    showRecoveryModal,
    sessionKey,
    activeQuestions,
  ]);

  // Clean up session on quiz completion
  useEffect(() => {
    if (isCompleted) {
      localStorage.removeItem(sessionKey);
    }
  }, [isCompleted, sessionKey]);

  // Timer loop
  useEffect(() => {
    if (isCompleted || showRecoveryModal || activeQuestions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCompleted, showRecoveryModal, activeQuestions]);

  const currentQuestion = activeQuestions[currentIdx] || questions[0];

  // Multiple Choice Select Option
  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentQuestion) return;
    setSelectedOpt(opt);
    setIsAnswered(true);

    const correct = opt === currentQuestion.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setWrongQuestionIds((prev) => [...prev, currentQuestion.id]);
    }
  };

  // Sentence Builder Click Word
  const handleWordClick = (word: string) => {
    if (isAnswered) return;
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (wordIndex: number) => {
    if (isAnswered) return;
    setSelectedWords((prev) => prev.filter((_, idx) => idx !== wordIndex));
  };

  const handleClearWords = () => {
    if (isAnswered) return;
    setSelectedWords([]);
  };

  const handleCheckSentenceBuilder = () => {
    if (isAnswered || !currentQuestion) return;
    setIsAnswered(true);

    const rawAnswer = selectedWords.join(' ').replace(/\s+/g, ' ').trim();
    const cleanAnswer = rawAnswer.replace(/\s+([.,!?;])/g, '$1');
    const correct = cleanAnswer.toLowerCase() === currentQuestion.answer.toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setWrongQuestionIds((prev) => [...prev, currentQuestion.id]);
    }
  };

  // Error Spotlight Click Word
  const handleSelectErrorWord = (word: string) => {
    if (isAnswered) return;
    const cleanWord = word.replace(/[.,!?;]/g, '');
    setSelectedErrorWord(cleanWord);
  };

  const handleCheckErrorSpotlight = () => {
    if (isAnswered || !selectedErrorWord || !correctedText || !currentQuestion) return;
    setIsAnswered(true);

    const isTargetCorrect = selectedErrorWord.toLowerCase() === currentQuestion.incorrectWord?.toLowerCase();
    const isCorrectionCorrect = correctedText.trim().toLowerCase() === currentQuestion.correctWord?.toLowerCase();

    const correct = isTargetCorrect && isCorrectionCorrect;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setWrongQuestionIds((prev) => [...prev, currentQuestion.id]);
    }
  };

  const handleNext = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);

      // Reset individual states
      setSelectedOpt(null);
      setSelectedWords([]);
      setSelectedErrorWord(null);
      setCorrectedText('');
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      setIsCompleted(true);
    }
  };

  const resetQuiz = () => {
    setActiveQuestions(questions);
    setCurrentIdx(0);

    // Reset individual states
    setSelectedOpt(null);
    setSelectedWords([]);
    setSelectedErrorWord(null);
    setCorrectedText('');
    setIsAnswered(false);
    setIsCorrect(null);

    setScore(0);
    setIsCompleted(false);
    setWrongQuestionIds([]);
    setTimeLeft(questions.length * 60);
  };

  const retryMistakes = () => {
    const mistakes = questions.filter((q) => wrongQuestionIds.includes(q.id));
    setActiveQuestions(mistakes);
    setCurrentIdx(0);

    // Reset individual states
    setSelectedOpt(null);
    setSelectedWords([]);
    setSelectedErrorWord(null);
    setCorrectedText('');
    setIsAnswered(false);
    setIsCorrect(null);

    setScore(0);
    setIsCompleted(false);
    setWrongQuestionIds([]);
    setTimeLeft(mistakes.length * 60);
  };

  const handleSaveTrap = async (q: ExamQuestion) => {
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
  };

  return {
    isLoading: isLessonLoading || isCrowdsourcedLoading,
    questions,
    activeQuestions,
    currentIdx,
    currentQuestion,
    selectedOpt,
    selectedWords,
    selectedErrorWord,
    correctedText,
    isAnswered,
    isCorrect,
    score,
    isCompleted,
    wrongQuestionIds,
    timeLeft,
    showRecoveryModal,
    recoveryData,
    savedTrapIds,
    setCorrectedText,
    handleSelectOption,
    handleWordClick,
    handleRemoveWord,
    handleClearWords,
    handleCheckSentenceBuilder,
    handleSelectErrorWord,
    handleCheckErrorSpotlight,
    handleNext,
    resetQuiz,
    retryMistakes,
    handleSaveTrap,
    handleRecover,
    handleDiscard,
  };
}
