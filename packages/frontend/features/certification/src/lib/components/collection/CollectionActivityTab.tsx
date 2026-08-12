import { Activity, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@spark-nest-ed/frontend-shared-components';
import { RecentActivity } from '../../hooks/container-logic/collection/use-collection-detail-container-logic';
import { ComingSoonSection } from '../shared/ComingSoonSection';

interface CollectionActivityTabProps {
  activities: RecentActivity[];
  isLoading: boolean;
}

export const CollectionActivityTab = ({
  activities,
  isLoading,
}: CollectionActivityTabProps) => {
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
