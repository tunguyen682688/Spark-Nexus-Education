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
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
          {LISTENING_DASHBOARD_TEXT.PROGRESS_TITLE}
        </h3>

        {/* Horizontal Progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-baseline text-slate-300">
            <span className="text-2xl font-black">
              {progressPercent}%
            </span>
            <span className="text-xs font-bold text-slate-500">
              {LISTENING_DASHBOARD_TEXT.PROGRESS_COMPLETED}
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2 bg-slate-950 border border-slate-850"
          />
        </div>
      </div>

      {/* Progress details stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-800/60 text-slate-400">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">
            {LISTENING_DASHBOARD_TEXT.STATS_PRACTICE}
          </span>
          <span className="text-xs font-extrabold text-slate-200">
            {timeSpent} {LISTENING_DASHBOARD_TEXT.STATS_TIME_UNIT}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">
            {LISTENING_DASHBOARD_TEXT.STATS_SUBTITLES}
          </span>
          <span className="text-xs font-extrabold text-slate-200">
            {sentenceCount} {LISTENING_DASHBOARD_TEXT.STATS_SUBTITLES_UNIT}
          </span>
        </div>
      </div>
    </div>
  );
};
