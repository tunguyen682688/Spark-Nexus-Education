import React from 'react';
import { Clock } from 'lucide-react';
import { Progress } from '@spark-nest-ed/frontend-shared-components';
import { LISTENING_LIBRARY_TEXT } from '../constants';

interface LibraryDailyGoalCardProps {
  todayMinutes: number;
  dailyTarget: number;
  dailyProgressPercent: number;
}

export const LibraryDailyGoalCard: React.FC<LibraryDailyGoalCardProps> = ({
  todayMinutes,
  dailyTarget,
  dailyProgressPercent,
}) => {
  const text = LISTENING_LIBRARY_TEXT.DAILY_GOAL_CARD;
  return (
    <div className="bg-card/40 border border-border rounded-3xl p-6 flex flex-col justify-between shadow-lg">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
            {text.LABEL}
          </span>
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-foreground">{todayMinutes}</span>
          <span className="text-xs font-bold text-muted-foreground">/ {dailyTarget} {text.UNIT}</span>
        </div>
        <div className="space-y-1 pt-1">
          <Progress value={dailyProgressPercent} className="h-1.5 bg-background border border-border" />
          <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
            <span>{text.PROGRESS_LABEL}</span>
            <span>{dailyProgressPercent}%</span>
          </div>
        </div>
      </div>
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground">{text.ACTIVITY_LABEL}</span>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${
          dailyProgressPercent >= 100 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {dailyProgressPercent >= 100 ? text.STATUS_COMPLETED : text.STATUS_IN_PROGRESS}
        </span>
      </div>
    </div>
  );
};

export default LibraryDailyGoalCard;
