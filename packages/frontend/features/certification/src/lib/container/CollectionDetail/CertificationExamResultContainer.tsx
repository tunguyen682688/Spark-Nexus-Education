import React from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { useExamResult } from '../../hooks/use-certification';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface CertificationExamResultContainerProps {
  resultId?: string;
  onRetake?: () => void;
  onBackToDashboard?: () => void;
}

export const CertificationExamResultContainer: React.FC<
  CertificationExamResultContainerProps
> = ({ resultId = 'result-123', onRetake, onBackToDashboard }) => {
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
      {/* SCORECARD HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-700 text-white p-8 text-center shadow-xl space-y-4">
        <Badge className="bg-white/20 text-white border-none text-xs font-bold py-1 px-3">
          <Trophy className="w-4 h-4 mr-1 text-amber-300" /> EXAM SCORECARD
        </Badge>

        <h1 className="text-3xl font-extrabold tracking-tight">
          {result.examTitle || 'IELTS Mock Exam Completed'}
        </h1>

        <div className="flex justify-center items-baseline gap-2 pt-2">
          <span className="text-5xl font-black text-amber-300">
            {result.score || result.totalScore || '7.5'}
          </span>
          <span className="text-sm font-semibold text-emerald-100">
            / {result.maxScore || '9.0'} Band Score
          </span>
        </div>

        <p className="text-xs text-emerald-100 font-medium max-w-md mx-auto">
          Congratulations! You performed significantly higher than 84% of
          candidates this week.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          {onRetake && (
            <Button
              onClick={onRetake}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-xs font-bold py-2.5 px-5 rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" /> Retake Exam
            </Button>
          )}
          {onBackToDashboard && (
            <Button
              onClick={onBackToDashboard}
              className="bg-white text-indigo-700 hover:bg-blue-50 text-xs font-bold py-2.5 px-5 rounded-xl shadow-md"
            >
              Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>

      {/* DETAILED STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold">
                {result.correctCount || 34}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                Correct Answers
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold">
                {result.incorrectCount || 6}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                Incorrect Answers
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold">
                {result.accuracy || '85%'}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                Accuracy Rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
