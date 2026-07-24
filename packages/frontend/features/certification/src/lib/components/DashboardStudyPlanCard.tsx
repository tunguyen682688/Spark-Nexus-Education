import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { ListSkeleton } from './LoadingSkeleton';
import { StudyPlanDay } from '../types';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface DashboardStudyPlanCardProps {
  studyPlan: StudyPlanDay[];
  isLoading: boolean;
}

export const DashboardStudyPlanCard: React.FC<DashboardStudyPlanCardProps> = ({
  studyPlan,
  isLoading,
}) => {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold">
            {CERTIFICATION_UI_TEXT.dashboard.studyScheduleTitle}
          </CardTitle>
          <CardDescription>
            {CERTIFICATION_UI_TEXT.dashboard.studyScheduleDesc}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ListSkeleton />
        ) : studyPlan.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
            {CERTIFICATION_UI_TEXT.dashboard.emptyState.noStudyPlan}
          </div>
        ) : (
          <div className="space-y-3">
            {studyPlan.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 font-bold flex items-center justify-center text-xs">
                    {item.day}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.topic} &bull; {item.duration}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={item.completed ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {item.completed
                    ? CERTIFICATION_UI_TEXT.dashboard.doneStatus
                    : CERTIFICATION_UI_TEXT.dashboard.pendingStatus}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
