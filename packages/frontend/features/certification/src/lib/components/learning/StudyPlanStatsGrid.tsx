import { Card, CardContent } from '@spark-nest-ed/frontend-shared-components';
import { StudyPlanTopStat } from '../../hooks/container-logic/learning/use-study-plan-container-logic';

interface StudyPlanStatsGridProps {
  stats: StudyPlanTopStat[];
}

export const StudyPlanStatsGrid = ({
  stats,
}: StudyPlanStatsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, idx) => (
        <Card
          key={idx}
          className="border-border hover:shadow-sm transition-shadow duration-300"
        >
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {stat.label}
            </span>
            <div className={`text-2xl font-black ${stat.color}`}>{stat.val}</div>
            <div className="text-[10px] text-muted-foreground font-medium">
              {stat.sub}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
