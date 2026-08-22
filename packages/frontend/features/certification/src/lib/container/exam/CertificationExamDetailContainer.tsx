import { ArrowLeft } from 'lucide-react';
import { useExamDetailContainerLogic } from '../../hooks/container-logic/exam/use-exam-detail-container-logic';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { ExamDetailBanner } from '../../components/exam/detail/ExamDetailBanner';
import { ExamDetailSections } from '../../components/exam/detail/ExamDetailSections';
import { ExamDetailRules } from '../../components/exam/detail/ExamDetailRules';

interface CertificationExamDetailContainerProps {
  examId: string;
  onSessionStarted?: (sessionId: string) => void;
}

export const CertificationExamDetailContainer = ({ examId, onSessionStarted }: 
  CertificationExamDetailContainerProps
) => {
  const {
    exam,
    isLoading,
    isError,
    error,
    refetch,
    isStarting,
    handleBack,
    handleStartExam,
  } = useExamDetailContainerLogic(examId, onSessionStarted);

  const BackButton = () => (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer border border-border/50 shadow-sm"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Back</span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-12 max-w-5xl mx-auto">
        <BackButton />
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="w-full py-12 flex flex-col items-center gap-4 max-w-xl mx-auto">
        <BackButton />
        <ErrorState
          onRetry={refetch}
          message={
            error instanceof Error
              ? error.message
              : CERTIFICATION_UI_TEXT.error.exam
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 max-w-5xl mx-auto">
      <BackButton />

      <ExamDetailBanner
        code={exam.code}
        title={exam.title}
        description={exam.description}
        durationMinutes={exam.durationMinutes}
        passingScore={exam.passingScore}
        isStarting={isStarting}
        onStartExam={handleStartExam}
      />

      <ExamDetailSections sections={exam.sections} />

      <ExamDetailRules />
    </div>
  );
};
