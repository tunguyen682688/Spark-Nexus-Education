import { Activity, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@spark-nest-ed/frontend-shared-components';
import { useCollectionActivities } from '../hooks/use-certification';
import { RecentActivity } from '../hooks/useCollectionDetailContainerLogic';
import { ComingSoonSection } from './ComingSoonSection';

interface CollectionActivityTabProps {
  collectionId: string;
  recentActivities?: RecentActivity[];
}

export const CollectionActivityTab = ({
  collectionId,
  recentActivities: fallbackActivities = [],
}: CollectionActivityTabProps) => {
  const { data: liveActivities = [], isLoading } = useCollectionActivities(collectionId);

  const activities = liveActivities.length > 0 ? liveActivities : fallbackActivities;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" /> Live Learner Activity
          </div>
          {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <ComingSoonSection
            title="No activity yet"
            description="Real-time learner activity will appear here as users engage with this collection."
          />
        ) : (
          <div className="space-y-3">
            {activities.map((act, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-2 border-b border-border last:border-none"
              >
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{act.user}</strong>{' '}
                  {act.action}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
