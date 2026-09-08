import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useExamSession,
  useSaveSessionAnswer,
  useRecordSessionViolation,
  useSubmitExamSession,
} from '../../use-certification';
import type { UseExamSessionContainerLogicProps } from '../../../types/session.types';

export type { UseExamSessionContainerLogicProps } from '../../../types/session.types';

export function useExamSessionContainerLogic({
  sessionId,
  onSubmitted,
}: UseExamSessionContainerLogicProps) {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [tabViolations, setTabViolations] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

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

  const handleSubmit = useCallback(() => {
    if (submittedRef.current) return;
    if (!window.confirm('Are you sure you want to submit the exam? This action cannot be undone.')) return;
    submittedRef.current = true;
    submitSession(sessionId, {
      onSuccess: (res) => {
        if (onSubmitted) {
          onSubmitted(res.id || '');
        } else {
          navigate(`/certification/result/${res.id || ''}`);
        }
      },
    });
  }, [sessionId, submitSession, onSubmitted, navigate]);

  // Hydrate answers from session on load (page refresh recovery)
  useEffect(() => {
    if (session?.answers && session.answers.length > 0) {
      const hydrated: Record<string, string> = {};
      session.answers.forEach((a) => {
        if (a.questionId && a.answerText) {
          hydrated[a.questionId] = a.answerText;
        }
      });
      setUserAnswers((prev) => ({ ...prev, ...hydrated }));
    }
  }, [session?.answers]);

  // Initialize timer from session remaining seconds
  useEffect(() => {
    if (session?.remainingSeconds != null && session.status === 'in_progress') {
      setRemainingSeconds(session.remainingSeconds);
    }
  }, [session?.remainingSeconds, session?.status]);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0 || session?.status !== 'in_progress') return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-submit when time expires
          if (!submittedRef.current) {
            submittedRef.current = true;
            submitSession(sessionId, {
              onSuccess: (res) => {
                if (onSubmitted) {
                  onSubmitted(res.id || '');
                } else {
                  navigate(`/certification/result/${res.id || ''}`);
                }
              },
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.status, sessionId, submitSession, onSubmitted, navigate, remainingSeconds]);

  // Tab violation tracking (only after session is loaded and in progress)
  useEffect(() => {
    if (!session || session.status !== 'in_progress') return;

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
  }, [sessionId, recordViolation, session]);

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
    remainingSeconds,
    handleSelectChoice,
    handleSubmit,
    goToPrevious,
    goToNext,
  };
}
