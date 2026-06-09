import React from 'react';
import { Progress } from '../ui/progress';

interface ProgressTrackerProps {
  completedCount: number;
  totalCount: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completedCount,
  totalCount,
}) => {
  const progressValue = (completedCount / totalCount) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span>Progress: {Math.round(progressValue)}%</span>
        <span>
          {completedCount} of {totalCount} words
        </span>
      </div>
      <Progress value={progressValue} className="h-2" />
    </div>
  );
};
