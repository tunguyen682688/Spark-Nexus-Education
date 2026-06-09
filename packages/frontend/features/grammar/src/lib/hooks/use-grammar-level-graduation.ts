import { useState, useEffect, useRef, useMemo } from 'react';
import { useGrammarPracticeQuestions } from './use-grammar-practice';
import { useSubmitLevelGraduation } from './use-grammar-exams';

export interface GraduationQuestion {
  id: string;
  text: string;
  options: string[];
  answer: string;
}

export const MOCK_GRAD_QUESTIONS: GraduationQuestion[] = [
  {
    id: 'gq-1',
    text: 'Had I known about the subjunctive mood lesson, I _____ it earlier.',
    options: ['studied', 'would have studied', 'had studied', 'will study'],
    answer: 'would have studied',
  },
  {
    id: 'gq-2',
    text: 'The dean demanded that all professors _____ present at the CEFR graduation.',
    options: ['are', 'be', 'were', 'should been'],
    answer: 'be',
  },
  {
    id: 'gq-3',
    text: 'No sooner _____ the exam room than the fire alarm went off.',
    options: ['we had entered', 'had we entered', 'did we enter', 'entered we'],
    answer: 'had we entered',
  },
  {
    id: 'gq-4',
    text: 'I would rather you _____ use native alerts in this React monorepo.',
    options: ['do not', 'did not', 'would not', 'had not'],
    answer: 'did not',
  },
  {
    id: 'gq-5',
    text: 'It is highly recommended that she _____ the graduation practice test.',
    options: ['take', 'takes', 'took', 'should take'],
    answer: 'take',
  },
  {
    id: 'gq-6',
    text: 'By the end of this year, she _____ grammar for six months straight.',
    options: ['will study', 'will have studied', 'studies', 'has studied'],
    answer: 'will have studied',
  },
  {
    id: 'gq-7',
    text: 'Under no circumstances _____ you reveal the database credentials.',
    options: ['you should', 'should you', 'must you to', 'you will'],
    answer: 'should you',
  },
  {
    id: 'gq-8',
    text: 'He talked as if he _____ all the CEFR rules by heart.',
    options: ['knows', 'knew', 'had known', 'would know'],
    answer: 'knew',
  },
  {
    id: 'gq-9',
    text: 'Only when she passed the exam _____ she feel relieved.',
    options: ['did', 'was', 'does', 'had'],
    answer: 'did',
  },
  {
    id: 'gq-10',
    text: 'Were it not for your help, I _____ this graduation test.',
    options: ['would fail', 'would have failed', 'failed', 'will fail'],
    answer: 'would have failed',
  },
];

export function useGrammarLevelGraduation(
  level: string,
  onFinish: (score: number, isPassed: boolean) => void
) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  // Fetch practice questions for the active level
  const { data: dbQuestions = [], isLoading } = useGrammarPracticeQuestions({
    level,
  });

  const submitGraduationMutation = useSubmitLevelGraduation();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Map dbQuestions to GraduationQuestion structure
  // Choose MULTIPLE_CHOICE questions if possible, otherwise fallback
  const questions = useMemo<GraduationQuestion[]>(() => {
    const mcQuestions = dbQuestions
      .filter((q) => q.type === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0)
      .map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options || [],
        answer: q.correctAnswer,
      }));

    if (mcQuestions.length >= 5) {
      // Return maximum 10 questions for the graduation test
      return mcQuestions.slice(0, 10);
    }

    // Fallback to MOCK_GRAD_QUESTIONS if database doesn't have enough questions
    return MOCK_GRAD_QUESTIONS;
  }, [dbQuestions]);

  const currentQuestion = questions[currentIdx] || null;

  // Countdown timer effect
  useEffect(() => {
    if (isExamCompleted || isLoading) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamCompleted, isLoading]);

  const handleSelectOption = (opt: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: opt,
    }));
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setFlags((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleNavigateQuestion = (idx: number) => {
    setCurrentIdx(idx);
  };

  // Tính kết quả thi tốt nghiệp
  const { correctCount, percentage, isPassed } = useMemo(() => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++;
      }
    });

    const pct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = pct >= 80;

    return {
      correctCount: correct,
      percentage: pct,
      isPassed: passed,
    };
  }, [questions, answers]);

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsExamCompleted(true);

    try {
      await submitGraduationMutation.mutateAsync({
        level,
        percentage,
      });
      // Call container finish callback
      onFinish(correctCount, isPassed);
    } catch (err) {
      console.error('Failed to submit level graduation:', err);
    }
  };

  const resetExam = () => {
    setIsExamCompleted(false);
    setAnswers({});
    setFlags({});
    setTimeLeft(600);
    setCurrentIdx(0);
  };

  return {
    questions,
    currentIdx,
    setCurrentIdx,
    currentQuestion,
    answers,
    flags,
    timeLeft,
    isExamCompleted,
    isLoading,
    correctCount,
    percentage,
    isPassed,
    handleSelectOption,
    toggleFlag,
    handleNavigateQuestion,
    handleSubmit,
    resetExam,
    isSubmitting: submitGraduationMutation.isPending,
  };
}
