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
import { useExamSessionContainerLogic } from '../../hooks/container-logic/exam/use-exam-session-container-logic';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface CertificationExamSessionContainerProps {
  sessionId?: string;
  onSubmitted?: (resultId: string) => void;
  onExit?: () => void;
}

export const CertificationExamSessionContainer = ({ sessionId: rawSessionId = 'session-123', onSubmitted, onExit }: 
  CertificationExamSessionContainerProps
) => {
  const sessionId = rawSessionId ?? 'session-123';
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
    handleSelectChoice,
    handleSubmit,
    goToPrevious,
    goToNext,
  } = useExamSessionContainerLogic({ sessionId, onSubmitted });

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3">
          {onExit && (
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> {CERTIFICATION_UI_TEXT.examSession.exit}
            </Button>
          )}
          <h2 className="text-sm font-black">
            {session.examTitle || session.title || CERTIFICATION_UI_TEXT.examSession.defaultTitle}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {tabViolations > 0 && (
            <Badge variant="destructive" className="text-[10px] font-bold">
              <ShieldAlert className="w-3 h-3 mr-1" /> {tabViolations} {CERTIFICATION_UI_TEXT.examSession.tabWarning}
            </Badge>
          )}

          <div className="flex items-center gap-1.5 font-bold text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 py-1.5 px-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>45:00 {CERTIFICATION_UI_TEXT.examSession.timeRemaining}</span>
          </div>

          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
          >
            {CERTIFICATION_UI_TEXT.examSession.submitExam}
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-bold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm sm:text-base font-extrabold text-foreground leading-relaxed">
            {currentQ?.content}
          </p>

          <div className="space-y-3">
            {currentQ?.choices?.map((choice, idx) => {
              const choiceText = typeof choice === 'string' ? choice : choice.content;
              const isSelected = userAnswers[currentQ.id] === choiceText;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectChoice(choiceText)}
                  className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                      : 'border-border hover:border-slate-400 bg-card text-foreground'
                  }`}
                >
                  <span>{choiceText}</span>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-indigo-600 fill-current" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <Button
              disabled={currentQuestionIndex === 0}
              onClick={goToPrevious}
              variant="outline"
              size="sm"
              className="text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> {CERTIFICATION_UI_TEXT.examSession.previousQuestion}
            </Button>

            <Button
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={goToNext}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              {CERTIFICATION_UI_TEXT.examSession.nextQuestion} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
