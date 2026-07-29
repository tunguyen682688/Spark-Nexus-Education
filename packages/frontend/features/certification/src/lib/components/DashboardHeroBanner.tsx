import { ArrowRight, Trophy, Target } from 'lucide-react';
import { Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';
import { DashboardStats } from '../types';

interface DashboardHeroBannerProps {
  dashboardData?: DashboardStats;
  selectedExamType: string;
  topStudentName?: string;
  onExploreCollection: () => void;
  onExploreLibrary: () => void;
}

export const DashboardHeroBanner = ({
  dashboardData,
  selectedExamType,
  topStudentName,
  onExploreCollection,
  onExploreLibrary,
}: DashboardHeroBannerProps) => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-900 text-white p-6 sm:p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
      {/* Left Hero Text Content */}
      <div className="space-y-4 max-w-xl text-center md:text-left z-10">
        <Badge
          variant="outline"
          className="bg-white/10 text-white border-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md"
        >
          <span role="img" aria-label="sparkles">
            ✨
          </span>{' '}
          {CERTIFICATION_UI_TEXT.dashboard.platformBadge}
        </Badge>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight whitespace-pre-line">
          {CERTIFICATION_UI_TEXT.dashboard.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-blue-100 font-light max-w-md">
          {CERTIFICATION_UI_TEXT.dashboard.subtitle}
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
          <Button
            onClick={onExploreCollection}
            className="bg-white text-indigo-700 hover:bg-blue-50 font-bold px-6 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group flex items-center gap-2 cursor-pointer"
          >
            {CERTIFICATION_UI_TEXT.dashboard.exploreCollectionBtn}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            onClick={onExploreLibrary}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 font-medium px-6 py-5 rounded-xl backdrop-blur-sm cursor-pointer"
          >
            {CERTIFICATION_UI_TEXT.dashboard.exploreLibraryBtn}
          </Button>
        </div>
      </div>

      {/* Dynamic Live Analytics Card */}
      <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[4/3] flex items-center justify-center z-10 md:mr-4">
        <div className="absolute w-full h-full bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">
              {CERTIFICATION_UI_TEXT.dashboard.liveAnalyticsTitle}
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="my-auto space-y-3">
            {/* Dynamic Score Prediction */}
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-4.5 h-4.5 text-amber-300" />
                </div>
                <div>
                  <div className="text-[10px] text-blue-200">
                    {dashboardData?.targetExam || selectedExamType} Target
                  </div>
                  <div className="text-sm font-bold">
                    {CERTIFICATION_UI_TEXT.dashboard.estimatedScore}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-amber-300">
                  {dashboardData?.scorePrediction || '--'}
                </div>
                <div className="text-[9px] text-emerald-400 font-semibold">
                  {dashboardData?.scoreRange || CERTIFICATION_UI_TEXT.common.noData}
                </div>
              </div>
            </div>

            {/* Dynamic Accuracy Rate */}
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <Target className="w-4.5 h-4.5 text-sky-300" />
                </div>
                <div>
                  <div className="text-[10px] text-blue-200">
                    {CERTIFICATION_UI_TEXT.dashboard.accuracyRate}
                  </div>
                  <div className="text-sm font-bold">
                    {CERTIFICATION_UI_TEXT.dashboard.last7Days}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-sky-300">
                  {dashboardData?.accuracy || '--'}
                </div>
                <div className="text-[9px] text-blue-200">
                  {CERTIFICATION_UI_TEXT.dashboard.verified}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-blue-200 border-t border-white/5 pt-2">
            <span>{topStudentName || CERTIFICATION_UI_TEXT.common.noData}</span>
            <span>
              {dashboardData?.daysRemaining
                ? `${dashboardData.daysRemaining} ${CERTIFICATION_UI_TEXT.dashboard.daysLeft}`
                : CERTIFICATION_UI_TEXT.dashboard.activeStreak}
            </span>
          </div>
        </div>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-400/20 blur-xl -z-10" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-400/20 blur-2xl -z-10" />
      </div>
    </div>
  );
};
