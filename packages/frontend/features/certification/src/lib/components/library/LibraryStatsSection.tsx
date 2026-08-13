import {
  Bookmark,
} from 'lucide-react';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

import type { DashboardStats } from '../../types/dashboard.types';

interface LibraryStatsSectionProps {
  totalSavedCount: number;
  dashboardStats?: DashboardStats;
  libText: typeof CERTIFICATION_UI_TEXT.library;
}

export const LibraryStatsSection = ({
  totalSavedCount,
  dashboardStats,
  libText,
}: LibraryStatsSectionProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-800 text-white p-6 sm:p-8 shadow-xl">
      <div className="relative z-10 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Bookmark className="w-7 h-7 text-amber-300 fill-current" />
          {libText.title}
        </h1>
        <p className="text-sm text-indigo-100 font-medium max-w-2xl">
          {libText.subtitle}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">
              {libText.metrics.savedCollections}
            </span>
            <span className="text-xl font-black text-white">
              {totalSavedCount}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">
              {libText.metrics.mocksCompleted}
            </span>
            <span className="text-xl font-black text-emerald-300">
              {dashboardStats?.completedMocks || '0'}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">
              {libText.metrics.accuracyScore}
            </span>
            <span className="text-xl font-black text-amber-300">
              {dashboardStats?.accuracy || '0%'}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">
              {libText.metrics.targetScore}
            </span>
            <span className="text-xl font-black text-sky-300">
              {dashboardStats?.targetScore || '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
