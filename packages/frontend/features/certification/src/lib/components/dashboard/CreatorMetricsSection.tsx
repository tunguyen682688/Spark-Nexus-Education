import {
  FileText,
  HelpCircle,
  Users,
  TrendingUp,
  Heart,
} from 'lucide-react';
import { Card } from '@spark-nest-ed/frontend-shared-components';

interface CreatorMetricsSectionProps {
  metrics: {
    totalExams: number;
    totalExamsWeeklyChange: string;
    totalQuestions: number;
    totalQuestionsWeeklyChange: string;
    totalAttempts: number;
    totalAttemptsWeeklyChange: string;
    averageScore: string;
    averageScoreWeeklyChange: string;
    likesReceived: number;
    likesReceivedWeeklyChange: string;
  };
  text: {
    totalExams: string;
    totalQuestions: string;
    totalAttempts: string;
    avgScore: string;
    likesReceived: string;
  };
}

export const CreatorMetricsSection = ({ metrics, text }: CreatorMetricsSectionProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="border-border shadow-sm p-4 bg-card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.totalExams}
          </span>
          <div className="text-2xl font-black text-foreground mt-0.5">
            {metrics.totalExams}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {metrics.totalExamsWeeklyChange}
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 bg-card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.totalQuestions}
          </span>
          <div className="text-2xl font-black text-foreground mt-0.5">
            {metrics.totalQuestions.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {metrics.totalQuestionsWeeklyChange}
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 bg-card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.totalAttempts}
          </span>
          <div className="text-2xl font-black text-foreground mt-0.5">
            {metrics.totalAttempts.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {metrics.totalAttemptsWeeklyChange}
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 bg-card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.avgScore}
          </span>
          <div className="text-2xl font-black text-foreground mt-0.5">
            {metrics.averageScore}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {metrics.averageScoreWeeklyChange}
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 bg-card col-span-2 md:col-span-1 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.likesReceived}
          </span>
          <div className="text-2xl font-black text-foreground mt-0.5">
            {metrics.likesReceived}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {metrics.likesReceivedWeeklyChange}
          </span>
        </div>
      </Card>
    </div>
  );
};
