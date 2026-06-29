import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGrammarPracticeQuestions } from './use-grammar-practice';
import { useSubmitLevelGraduation } from './use-grammar-exams';

export interface GraduationQuestion {
  id: string;
  text: string;
  options: string[];
  answer: string;
}

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
  // Choose MULTIPLE_CHOICE questions if possible
  const questions = useMemo<GraduationQuestion[]>(() => {
    return dbQuestions
      .filter(
        (q) => q.type === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0
      )
      .map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options || [],
        answer: q.correctAnswer,
      }))
      .slice(0, 10);
  }, [dbQuestions]);

  const currentQuestion = questions[currentIdx] || null;

  // Tính kết quả thi tốt nghiệp
  const { correctCount, percentage, isPassed } = useMemo(() => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++;
      }
    });

    const pct =
      questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const passed = pct >= 80;

    return {
      correctCount: correct,
      percentage: pct,
      isPassed: passed,
    };
  }, [questions, answers]);
  const handleSubmit = useCallback(async () => {
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
  }, [submitGraduationMutation, level, percentage, correctCount, isPassed, onFinish]);

  // Countdown timer effect
  useEffect(() => {
    if (isExamCompleted || isLoading || questions.length === 0) return;

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
  }, [handleSubmit, isExamCompleted, isLoading, questions]);

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
