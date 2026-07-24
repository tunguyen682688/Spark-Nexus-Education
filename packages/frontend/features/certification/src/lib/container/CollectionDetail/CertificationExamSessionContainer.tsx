import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import {
  useExamSession,
  useSaveSessionAnswer,
  useRecordSessionViolation,
  useSubmitExamSession,
} from '../../hooks/use-certification';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

/**
 * Certification Exam Session Container Component
 */
interface CertificationExamSessionContainerProps {
  sessionId?: string;
  onSubmitted?: (resultId: string) => void;
  onExit?: () => void;
}

export const CertificationExamSessionContainer: React.FC<
  CertificationExamSessionContainerProps
> = ({ sessionId = 'session-123', onSubmitted, onExit }) => {
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

  // Anti-cheat tab switch listener
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

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-12 max-w-5xl mx-auto">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="w-full py-12 flex justify-center max-w-xl mx-auto">
        <ErrorState
          onRetry={refetch}
          message={
            error instanceof Error
              ? error.message
              : CERTIFICATION_UI_TEXT.error.startSession
          }
        />
      </div>
    );
  }

  const questions = session.questions || [
    {
      id: 'q1',
      content: 'What is the main purpose of IELTS Academic Writing Task 2?',
      choices: [
        'To write a personal story',
        'To present a formal argument or solution',
        'To summarize a graph',
        'To translate text',
      ],
      questionType: 'MCQ',
    },
    {
      id: 'q2',
      content: 'What is the recommended minimum word count for Task 2?',
      choices: ['150 words', '200 words', '250 words', '300 words'],
      questionType: 'MCQ',
    },
  ];

  const currentQ = questions[currentQuestionIndex] || questions[0];

  const handleSelectChoice = (choiceText: string) => {
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: choiceText }));
    saveAnswer({
      sessionId,
      dto: { questionId: currentQ.id, answerText: choiceText },
    });
  };

  const handleSubmit = () => {
    submitSession(sessionId, {
      onSuccess: (res) => {
        if (onSubmitted) onSubmitted(res.id || 'res-123');
      },
    });
  };

  return (
    <div className="w-full space-y-6 pb-12 max-w-5xl mx-auto">
      {/* EXAM SESSION TOP BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          {onExit && (
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Exit
            </Button>
          )}
          <h2 className="text-sm font-black">
            {session.examTitle || session.title || 'IELTS Mock Exam Session'}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {tabViolations > 0 && (
            <Badge variant="destructive" className="text-[10px] font-bold">
              <ShieldAlert className="w-3 h-3 mr-1" /> {tabViolations} Tab
              Switch Warning(s)
            </Badge>
          )}

          <div className="flex items-center gap-1.5 font-bold text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 py-1.5 px-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>45:00 Remaining</span>
          </div>

          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl"
          >
            Submit Exam
          </Button>
        </div>
      </div>

      {/* QUESTION CONTENT CARD */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm sm:text-base font-extrabold text-foreground leading-relaxed">
            {currentQ.content}
          </p>

          <div className="space-y-3">
            {currentQ.choices?.map((choice: string, idx: number) => {
              const isSelected = userAnswers[currentQ.id] === choice;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectChoice(choice)}
                  className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                      : 'border-border hover:border-slate-400 bg-card text-foreground'
                  }`}
                >
                  <span>{choice}</span>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-indigo-600 fill-current" />
                  )}
                </button>
              );
            })}
          </div>

          {/* QUESTION NAVIGATION BAR */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button
              disabled={currentQuestionIndex === 0}
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              variant="outline"
              size="sm"
              className="text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
            </Button>

            <Button
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
