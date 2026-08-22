import { useExamResult } from '../../hooks/use-certification';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { ExamResultScoreHero } from '../../components/exam/result/ExamResultScoreHero';
import { ExamResultStatsGrid } from '../../components/exam/result/ExamResultStatsGrid';

interface CertificationExamResultContainerProps {
  resultId?: string;
  onRetake?: () => void;
  onBackToDashboard?: () => void;
}

export const CertificationExamResultContainer = ({ resultId = 'result-123', onRetake, onBackToDashboard }: 
  CertificationExamResultContainerProps
) => {
  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useExamResult(resultId);

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-12 max-w-4xl mx-auto">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="w-full py-12 flex justify-center max-w-xl mx-auto">
        <ErrorState
          onRetry={refetch}
          message={
            error instanceof Error
              ? error.message
              : CERTIFICATION_UI_TEXT.error.submitSession
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 max-w-4xl mx-auto text-foreground">
      <ExamResultScoreHero
        examTitle={result.examTitle}
        score={result.score ?? result.totalScore}
        maxScore={String(result.maxScore)}
        onRetake={onRetake}
        onBackToDashboard={onBackToDashboard}
      />

      <ExamResultStatsGrid
        correctCount={result.correctCount}
        incorrectCount={result.incorrectCount}
        accuracy={result.accuracy}
      />
    </div>
  );
};
