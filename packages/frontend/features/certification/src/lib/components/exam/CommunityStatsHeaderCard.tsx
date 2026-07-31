import { Card, CardContent } from '@spark-nest-ed/frontend-shared-components';
import { CommunityHighlightStat } from '../../hooks/container-logic/browse/use-community-container-logic';

interface CommunityStatsHeaderCardProps {
  stats: CommunityHighlightStat[];
}

export const CommunityStatsHeaderCard = ({
  stats,
}: CommunityStatsHeaderCardProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stat.color}`}>
              <stat.Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight">
                {stat.displayValue}
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
