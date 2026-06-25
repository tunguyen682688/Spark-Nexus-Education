import React from 'react';
import { Flame, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@spark-nest-ed/frontend-shared-components';

interface HubStatsRowProps {
  displayStreak: number;
  displayTotalMinutes: number;
  displayCompletedLessons: number;
  dailyTargetMinutes: number;
  dailyProgressPercent: number;
}

export const HubStatsRow: React.FC<HubStatsRowProps> = ({
  displayStreak,
  displayTotalMinutes,
  displayCompletedLessons,
  dailyTargetMinutes,
  dailyProgressPercent,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Streak Stat */}
      <Card className="relative group overflow-hidden bg-slate-900/40 border border-slate-850 p-5 rounded-2xl backdrop-blur-sm hover:border-orange-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all" />
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-orange-500/10 text-orange-400 rounded-xl group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Chuỗi Streak</span>
            <span className="text-xl font-black text-slate-100">{displayStreak} ngày</span>
            <span className="text-[10px] text-orange-400/80 block mt-0.5 font-bold">
              Học cực đều đặn! 🔥
            </span>
          </div>
        </div>
      </Card>

      {/* Total Time Stat */}
      <Card className="relative group overflow-hidden bg-slate-900/40 border border-slate-850 p-5 rounded-2xl backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Thời lượng nghe</span>
            <span className="text-xl font-black text-slate-100">{displayTotalMinutes} phút</span>
            <span className="text-[10px] text-blue-400/80 block mt-0.5 font-bold">Đặt mục tiêu 30p/ngày</span>
          </div>
        </div>
      </Card>

      {/* Completed Lessons Stat */}
      <Card className="relative group overflow-hidden bg-slate-900/40 border border-slate-850 p-5 rounded-2xl backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 text-emerald-450 rounded-xl group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Bài hoàn thành</span>
            <span className="text-xl font-black text-slate-100">{displayCompletedLessons} bài học</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5 font-bold">Đã làm chủ kiến thức</span>
          </div>
        </div>
      </Card>

      {/* Goal Progress Stat */}
      <Card className="relative group overflow-hidden bg-slate-900/40 border border-slate-850 p-5 rounded-2xl backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
        <div className="flex items-center gap-4">
          {/* SVG circular progress */}
          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="4" fill="transparent" />
              <circle cx="24" cy="24" r="20" stroke="#a855f7" strokeWidth="4" fill="transparent"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - dailyProgressPercent / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-200">
              {dailyProgressPercent}%
            </div>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider block">Tiến độ hôm nay</span>
            <span className="text-lg font-black text-slate-100">{displayTotalMinutes}/{dailyTargetMinutes} phút</span>
            <span className="text-[10px] text-purple-400/80 block mt-0.5 font-bold">Mục tiêu hằng ngày</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HubStatsRow;
