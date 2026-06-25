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
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-5">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-455 flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          {text.TITLE}
        </h3>
        <p className="text-[10px] text-slate-500 mt-0.5">{text.SUBTITLE}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
          <Clock className="w-5 h-5 text-purple-400 mb-1" />
          <div>
            <span className="text-[10px] text-slate-550 block font-bold">{text.TIME_SPENT}</span>
            <span className="text-lg font-black text-slate-100">{totalListeningMinutes} {text.TIME_UNIT}</span>
          </div>
        </div>
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
          <Trophy className="w-5 h-5 text-emerald-400 mb-1" />
          <div>
            <span className="text-[10px] text-slate-555 block font-bold">{text.COMPLETED_COUNT}</span>
            <span className="text-lg font-black text-slate-100">{totalCompleted} {text.COMPLETED_UNIT}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/30 border border-slate-855 p-4 rounded-2xl space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-400">{text.AVERAGE_PROGRESS}</span>
          <span className="text-purple-455">{averageProgress}%</span>
        </div>
        <Progress value={averageProgress} className="h-1.5 bg-slate-950 border border-slate-850" />
      </div>
    </div>
  );
};

export default LibraryStatsSummaryCard;
