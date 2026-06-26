import React from 'react';
import { Progress } from '@spark-nest-ed/frontend-shared-components';
import { LISTENING_DASHBOARD_TEXT } from '../constants/listening-constants';

export interface StudyDashboardProgressProps {
  progressPercent: number;
  timeSpent: number;
  sentenceCount: number;
}

export const StudyDashboardProgress: React.FC<StudyDashboardProgressProps> = ({
  progressPercent,
  timeSpent,
  sentenceCount,
}) => {
  return (
    <div className="bg-card/40 border border-border rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          {LISTENING_DASHBOARD_TEXT.PROGRESS_TITLE}
        </h3>

        {/* Horizontal Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-baseline text-foreground">
            <span className="text-2xl font-black">
              {progressPercent}%
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {LISTENING_DASHBOARD_TEXT.PROGRESS_COMPLETED}
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2 bg-background border border-border"
          />
        </div>
      </div>

      {/* Progress details stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/60 text-muted-foreground">
        <div>
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">
            {LISTENING_DASHBOARD_TEXT.STATS_PRACTICE}
          </span>
          <span className="text-xs font-extrabold text-foreground">
            {timeSpent} {LISTENING_DASHBOARD_TEXT.STATS_TIME_UNIT}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">
            {LISTENING_DASHBOARD_TEXT.STATS_SUBTITLES}
          </span>
          <span className="text-xs font-extrabold text-foreground">
            {sentenceCount} {LISTENING_DASHBOARD_TEXT.STATS_SUBTITLES_UNIT}
          </span>
        </div>
      </div>
    </div>
  );
};
