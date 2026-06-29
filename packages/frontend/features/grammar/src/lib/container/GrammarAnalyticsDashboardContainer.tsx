import { useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useGrammarAnalytics } from '../hooks';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useNavigate } from 'react-router-dom';
import { GRAMMAR_UI_TEXT } from '../constants';
import {
  AnalyticsStatsGrid,
  AnalyticsXpChart,
  AnalyticsCategoryBreakdown,
} from '../components/analytics';

interface GrammarAnalyticsDashboardContainerProps {
  onBack: () => void;
}

export function GrammarAnalyticsDashboardContainer({
  onBack,
}: GrammarAnalyticsDashboardContainerProps) {
  const navigate = useNavigate();
  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
  } = useGrammarAnalytics();
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-full mx-auto min-h-[500px] flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <span className="text-xs font-bold tracking-widest uppercase">
          {GRAMMAR_UI_TEXT.analyticsDashboard.loading}
        </span>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="max-w-full mx-auto min-h-[500px] flex flex-col items-center justify-center gap-4 text-slate-450">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <span className="text-sm font-bold">
          {GRAMMAR_UI_TEXT.analyticsDashboard.errorLoad}
        </span>
        <Button
          onClick={() => refetch()}
          className="bg-slate-900 border border-slate-800 text-xs"
        >
          {GRAMMAR_UI_TEXT.analyticsDashboard.btnRetry}
        </Button>
      </div>
    );
  }

  const {
    totalTraps,
    trappedCount,
    brokenCount,
    accuracyRate,
    masteryPercentage,
    xpTrend,
    trapCategories,
  } = analytics;

  return (
    <div className="max-w-full mx-auto bg-card border border-border text-card-foreground rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-5 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              {GRAMMAR_UI_TEXT.analyticsDashboard.title}
              <Sparkles className="h-4.5 w-4.5 text-blue-400" />
            </h1>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
              {GRAMMAR_UI_TEXT.analyticsDashboard.subtitle}
            </span>
          </div>
        </div>

        <Button
          onClick={onBack}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-4 rounded-xl border-none shadow-md shadow-blue-500/10 cursor-pointer active:scale-95 transition-all"
        >
          {GRAMMAR_UI_TEXT.analyticsDashboard.btnBack}{' '}
          <span role="img" aria-label="book">
            📖
          </span>
        </Button>
      </div>

      {/* 4 Cards Stats Grid */}
      <AnalyticsStatsGrid
        masteryPercentage={masteryPercentage}
        totalTraps={totalTraps}
        trappedCount={trappedCount}
        brokenCount={brokenCount}
        accuracyRate={accuracyRate}
      />

      {/* Main Section: Chart & Categories Breakdown */}
      <div className="flex flex-col lg:flex-row gap-6 pt-6">
        {/* Left Side: SVG Chart */}
        <AnalyticsXpChart
          xpTrend={xpTrend}
          hoveredPointIdx={hoveredPointIdx}
          onHoverPoint={setHoveredPointIdx}
        />

        {/* Right Side: Skill & Trap categories breakdown */}
        <AnalyticsCategoryBreakdown
          trapCategories={trapCategories}
          trappedCount={trappedCount}
          onNavigateToTraps={() => navigate('/grammar/trap-diary')}
        />
      </div>
    </div>
  );
}
