import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  useExamSession,
  useSaveSessionAnswer,
  useRecordSessionViolation,
  useSubmitExamSession,
} from '../../use-certification';
import type { UseExamSessionContainerLogicProps } from '../../../types/exam-builder.types';

export type { UseExamSessionContainerLogicProps } from '../../../types/exam-builder.types';

export function useExamSessionContainerLogic({
  sessionId,
  onSubmitted,
}: UseExamSessionContainerLogicProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [tabViolations, setTabViolations] = useState(0);

  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
  } = useExamSession(sessionId);
  const { mutate: saveAnswer } = useSaveSessionAnswer();
  const { mutate: recordViolation } = useRecordSessionViolation();
  const { mutate: submitSession, isPending: isSubmitting } =
    useSubmitExamSession();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolations((prev) => {
          const next = prev + 1;
          recordViolation({
            sessionId,
            dto: {
              violationType: 'TAB_SWITCH',
              description: `Tab switched count: ${next}`,
            },
          });
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionId, recordViolation]);

  const questions = useMemo(
    () => session?.questions || [],
    [session?.questions]
  );

  const currentQ = useMemo(
    () => questions[currentQuestionIndex] || questions[0],
    [questions, currentQuestionIndex]
  );

  const handleSelectChoice = useCallback(
    (choiceText: string) => {
      if (!currentQ) return;
      setUserAnswers((prev) => ({ ...prev, [currentQ.id]: choiceText }));
      saveAnswer({
        sessionId,
        dto: { questionId: currentQ.id, answerText: choiceText },
      });
    },
    [currentQ, sessionId, saveAnswer]
  );

  const handleSubmit = useCallback(() => {
    submitSession(sessionId, {
      onSuccess: (res) => {
        if (onSubmitted) onSubmitted(res.id || '');
      },
    });
  }, [sessionId, submitSession, onSubmitted]);

  const goToPrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentQuestionIndex((prev) =>
      Math.min(questions.length - 1, prev + 1)
    );
  }, [questions.length]);

  return {
    session,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting,
    currentQuestionIndex,
    userAnswers,
    tabViolations,
    questions,
    currentQ,
    handleSelectChoice,
    handleSubmit,
    goToPrevious,
    goToNext,
  };
}
