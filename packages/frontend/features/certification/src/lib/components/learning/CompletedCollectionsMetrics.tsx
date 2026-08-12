import { CheckCircle2, Star, Award, Clock, BookOpen } from 'lucide-react';
import { Card } from '@spark-nest-ed/frontend-shared-components';
import type { CertificationUIText } from '../../constants/certification.constants';

interface CompletedCollectionsMetricsProps {
  computedMetrics: {
    completedSetsCount: number;
    avgAccuracyStr: string;
    certificatesCount: number;
    totalPracticeTimeStr: string;
    mocksMasteredCount: number;
  };
  totalCount: number;
  text: CertificationUIText['completedCollections'];
}

export const CompletedCollectionsMetrics = ({
  computedMetrics,
  totalCount,
  text,
}: CompletedCollectionsMetricsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.completedSets}
          </span>
          <div className="text-xl font-black text-foreground">{computedMetrics.completedSetsCount}</div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {text.metrics.finishRate}
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.avgAccuracy}
          </span>
          <div className="text-xl font-black text-foreground">
            {computedMetrics.avgAccuracyStr}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
            {text.metrics.monthlyImprovement}
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.certificatesIssued}
          </span>
          <div className="text-xl font-black text-foreground">
            {computedMetrics.certificatesCount}
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
            {text.metrics.verifiedDownloadable}
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.totalPracticeTime}
          </span>
          <div className="text-xl font-black text-foreground">
            {computedMetrics.totalPracticeTimeStr}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {text.metrics.loggedTime}
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card col-span-2 sm:col-span-1 hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.mocksMastered}
          </span>
          <div className="text-xl font-black text-foreground">
            {computedMetrics.mocksMasteredCount}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {text.metrics.mockTestsLabel}
          </span>
        </div>
      </Card>
    </div>
  );
};