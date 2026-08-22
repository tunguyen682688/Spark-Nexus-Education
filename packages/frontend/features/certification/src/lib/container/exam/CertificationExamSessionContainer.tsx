import { useNavigate } from 'react-router-dom';
import { useExamSessionContainerLogic } from '../../hooks/container-logic/exam/use-exam-session-container-logic';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { ExamSessionHeader } from '../../components/exam/session/ExamSessionHeader';
import { ExamSessionQuestionCard } from '../../components/exam/session/ExamSessionQuestionCard';

interface CertificationExamSessionContainerProps {
  sessionId?: string;
  onSubmitted?: (resultId: string) => void;
  onExit?: () => void;
}

export const CertificationExamSessionContainer = ({ sessionId: rawSessionId, onSubmitted, onExit }: 
  CertificationExamSessionContainerProps
) => {
  const navigate = useNavigate();
  const sessionId = rawSessionId || '';
  const {
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
  } = useExamSessionContainerLogic({ sessionId, onSubmitted });

  if (!sessionId) {
    return (
      <div className="w-full py-12 flex justify-center max-w-xl mx-auto">
        <ErrorState
          message="No session ID provided. Please start an exam from the detail page."
          onRetry={() => navigate('/certification/exams')}
        />
      </div>
    );
  }

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

  return (
    <div className="w-full space-y-6 pb-12 max-w-5xl mx-auto">
      <ExamSessionHeader
        examTitle={session.examTitle || session.title}
        tabViolations={tabViolations}
        isSubmitting={isSubmitting}
        remainingSeconds={remainingSeconds}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        onExit={onExit}
        onSubmit={handleSubmit}
      />

      <ExamSessionQuestionCard
        currentQuestionIndex={currentQuestionIndex}
        questionsLength={questions.length}
        currentQ={currentQ}
        userAnswers={userAnswers}
        onSelectChoice={handleSelectChoice}
        onAnswerChange={handleSelectChoice}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
    </div>
  );
};
