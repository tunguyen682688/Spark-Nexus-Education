import React from 'react';
import { Activity, Clock, Trophy } from 'lucide-react';
import { Progress } from '@spark-nest-ed/frontend-shared-components';
import { LISTENING_LIBRARY_TEXT } from '../constants';

interface LibraryStatsSummaryCardProps {
  totalListeningMinutes: number;
  totalCompleted: number;
  averageProgress: number;
}

export const LibraryStatsSummaryCard: React.FC<LibraryStatsSummaryCardProps> = ({
  totalListeningMinutes,
  totalCompleted,
  averageProgress,
}) => {
  const text = LISTENING_LIBRARY_TEXT.STATS_SUMMARY;
  return (
    <div className="bg-card/40 border border-border rounded-3xl p-6 shadow-lg space-y-5">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          {text.TITLE}
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">{text.SUBTITLE}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/40 border border-border p-4 rounded-2xl flex flex-col justify-between">
          <Clock className="w-5 h-5 text-primary mb-1" />
          <div>
            <span className="text-[10px] text-muted-foreground block font-bold">{text.TIME_SPENT}</span>
            <span className="text-lg font-black text-foreground">{totalListeningMinutes} {text.TIME_UNIT}</span>
          </div>
        </div>
        <div className="bg-muted/40 border border-border p-4 rounded-2xl flex flex-col justify-between">
          <Trophy className="w-5 h-5 text-emerald-400 mb-1" />
          <div>
            <span className="text-[10px] text-muted-foreground block font-bold">{text.COMPLETED_COUNT}</span>
            <span className="text-lg font-black text-foreground">{totalCompleted} {text.COMPLETED_UNIT}</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/20 border border-border p-4 rounded-2xl space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-muted-foreground">{text.AVERAGE_PROGRESS}</span>
          <span className="text-primary">{averageProgress}%</span>
        </div>
        <Progress value={averageProgress} className="h-1.5 bg-background border border-border" />
      </div>
    </div>
  );
};

export default LibraryStatsSummaryCard;
