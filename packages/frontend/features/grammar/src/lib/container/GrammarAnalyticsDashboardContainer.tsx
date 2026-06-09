import { useState } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Target,
  ArrowLeft,
  BookOpen,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useGrammarAnalytics } from '../hooks';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useNavigate } from 'react-router-dom';
import { GRAMMAR_UI_TEXT } from '../constants';

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

  // SVG Chart Dimensions
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 30;

  const minXp = Math.min(...xpTrend.map((d) => d.xp)) * 0.9;
  const maxXp = Math.max(...xpTrend.map((d) => d.xp)) * 1.1 || 100;
  const xpRange = maxXp - minXp;

  const points = xpTrend.map((d, i) => {
    const x =
      paddingLeft +
      (i / (xpTrend.length - 1)) * (chartWidth - paddingLeft - paddingRight);
    const y =
      chartHeight -
      paddingBottom -
      ((d.xp - minXp) / xpRange) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, ...d };
  });

  // Construct line path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Construct area path (closed loop back to baseline)
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${
          chartHeight - paddingBottom
        } L ${points[0].x} ${chartHeight - paddingBottom} Z`
      : '';

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {/* Stat 1: Mastery */}
        <div className="bg-muted/45 border border-border rounded-2xl p-5 space-y-2 hover:border-border/80 transition-colors">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[9px] font-black uppercase tracking-wider">
              {GRAMMAR_UI_TEXT.analyticsDashboard.cardMasteryTitle}
            </span>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {masteryPercentage}%
          </div>
          <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground font-medium">
            {GRAMMAR_UI_TEXT.analyticsDashboard.cardMasteryDesc}
          </p>
        </div>

        {/* Stat 2: Total Traps */}
        <div className="bg-muted/45 border border-border rounded-2xl p-5 space-y-2 hover:border-border/80 transition-colors">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[9px] font-black uppercase tracking-wider">
              {GRAMMAR_UI_TEXT.analyticsDashboard.cardTrapsTitle}
            </span>
            <ShieldAlert className="h-4 w-4 text-rose-455" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalTraps}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-rose-450 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            {GRAMMAR_UI_TEXT.analyticsDashboard.cardTrapsValue.replace('{count}', trappedCount.toString())}
          </div>
          <p className="text-[9px] text-muted-foreground font-medium">
            {GRAMMAR_UI_TEXT.analyticsDashboard.cardTrapsDesc}
          </p>
        </div>

        {/* Stat 3: Traps Broken */}
        <div className="bg-muted/45 border border-border rounded-2xl p-5 space-y-2 hover:border-border/80 transition-colors">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[9px] font-black uppercase tracking-wider">
              {GRAMMAR_UI_TEXT.analyticsDashboard.cardBrokenTitle}
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-455" />
          </div>
          <div className="text-2xl font-black text-foreground">{brokenCount}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {GRAMMAR_UI_TEXT.analyticsDashboard.cardBrokenValue}
          </div>
          <p className="text-[9px] text-muted-foreground font-medium">
            {GRAMMAR_UI_TEXT.analyticsDashboard.cardBrokenDesc}
          </p>
        </div>

        {/* Stat 4: Accuracy */}
        <div className="bg-muted/45 border border-border rounded-2xl p-5 space-y-2 hover:border-border/80 transition-colors">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[9px] font-black uppercase tracking-wider">
              {GRAMMAR_UI_TEXT.analyticsDashboard.cardAccuracyTitle}
            </span>
            <Target className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-foreground">{accuracyRate}%</div>
          <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${accuracyRate}%` }}
            />
          </div>
          <p className="text-[9px] text-muted-foreground font-medium">
            {GRAMMAR_UI_TEXT.analyticsDashboard.cardAccuracyDesc}
          </p>
        </div>
      </div>

      {/* Main Section: Chart & Categories Breakdown */}
      <div className="flex flex-col lg:flex-row gap-6 pt-6">
        {/* Left Side: SVG Chart */}
        <div className="flex-1 bg-muted/30 border border-border/80 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                XP GROWTH CURVE
              </span>
              <h4 className="text-sm font-extrabold text-foreground">
                {GRAMMAR_UI_TEXT.analyticsDashboard.chartTitle}
              </h4>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 font-extrabold text-[10px]">
              <TrendingUp className="h-3.5 w-3.5" />
              {GRAMMAR_UI_TEXT.analyticsDashboard.chartBadge}
            </div>
          </div>

          {/* SVG Line & Area Chart representing cumulative progress */}
          <div className="relative pt-2">
            <svg
              className="w-full h-auto overflow-visible"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 1, 2, 3].map((gIdx) => {
                const y =
                  paddingTop +
                  (gIdx / 3) * (chartHeight - paddingTop - paddingBottom);
                return (
                  <line
                    key={gIdx}
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    className="stroke-border/40"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Filled Area */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#areaGlow)"
                  className="transition-all duration-1000 ease-out"
                />
              )}

              {/* Line path */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  className="stroke-blue-500 transition-all duration-1000 ease-out"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interaction points */}
              {points.map((p, idx) => (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPointIdx(idx)}
                  onMouseLeave={() => setHoveredPointIdx(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPointIdx === idx ? '7' : '5'}
                    className="fill-blue-500 stroke-card transition-all"
                    strokeWidth={hoveredPointIdx === idx ? '3' : '2'}
                  />
                  {/* Tooltip Overlay within SVG */}
                  {hoveredPointIdx === idx && (
                    <g style={{ pointerEvents: 'none' }}>
                      <rect
                        x={p.x - 55}
                        y={p.y - 45}
                        width="110"
                        height="32"
                        rx="8"
                        className="fill-popover stroke-border"
                        strokeWidth="1"
                      />
                      <text
                        x={p.x}
                        y={p.y - 32}
                        className="fill-foreground text-[9px] font-black"
                        textAnchor="middle"
                      >
                        {p.dayName}
                      </text>
                      <text
                        x={p.x}
                        y={p.y - 20}
                        className="fill-blue-400 text-[10px] font-black"
                        textAnchor="middle"
                      >
                        {p.xp} XP
                      </text>
                    </g>
                  )}
                </g>
              ))}

              {/* X Axis Labels */}
              {points.map((p, idx) => (
                <text
                  key={`lbl-${idx}`}
                  x={p.x}
                  y={chartHeight - 12}
                  className="fill-muted-foreground font-extrabold text-[9px]"
                  textAnchor="middle"
                >
                  {p.dayName === 'Hôm nay'
                    ? GRAMMAR_UI_TEXT.analyticsDashboard.chartToday
                    : p.dayName.replace('Thứ ', 'T')}
                </text>
              ))}

              {/* Y Axis Labels */}
              {[0, 1, 2, 3].map((gIdx) => {
                const y =
                  paddingTop +
                  (gIdx / 3) * (chartHeight - paddingTop - paddingBottom);
                const xpVal = Math.round(maxXp - (gIdx / 3) * xpRange);
                return (
                  <text
                    key={`ylbl-${gIdx}`}
                    x={paddingLeft - 8}
                    y={y + 3}
                    className="fill-muted-foreground/80 font-extrabold text-[9px]"
                    textAnchor="end"
                  >
                    {xpVal}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Right Side: Skill & Trap categories breakdown */}
        <div className="w-full lg:w-80 bg-muted/30 border border-border/80 rounded-2xl p-5 space-y-5">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              TRAP DECOMPOSITION
            </span>
            <h4 className="text-sm font-extrabold text-foreground">
              {GRAMMAR_UI_TEXT.analyticsDashboard.sidebarTitle}
            </h4>
          </div>

          <div className="space-y-4">
            {trapCategories.map((cat, idx) => {
              const total = cat.trapped + cat.broken;
              const percent =
                total > 0 ? Math.round((cat.broken / total) * 100) : 100;

              // Color mappings based on status
              const hasTrapped = cat.trapped > 0;
              const barColor = hasTrapped
                ? 'bg-rose-500 shadow-rose-500/20'
                : 'bg-emerald-500';

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground/90">{cat.displayName}</span>
                    <span
                      className={`text-[10px] ${
                        hasTrapped ? 'text-rose-400' : 'text-muted-foreground'
                      }`}
                    >
                      {hasTrapped
                        ? GRAMMAR_UI_TEXT.analyticsDashboard.sidebarHasTraps.replace('{count}', cat.trapped.toString())
                        : GRAMMAR_UI_TEXT.analyticsDashboard.sidebarNoTraps}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 bg-background rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground w-8 text-right">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Callout inside Sidebar */}
          <div className="pt-3 border-t border-border">
            {trappedCount > 0 ? (
              <div className="bg-rose-950/10 border border-rose-500/10 rounded-xl p-3 text-center space-y-2">
                <p className="text-[10px] text-rose-455 leading-relaxed font-bold">
                  {GRAMMAR_UI_TEXT.analyticsDashboard.sidebarAlertTitle.replace('{count}', trappedCount.toString())}
                </p>
                <Button
                  onClick={() => navigate('/grammar/trap-diary')}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] py-2 rounded-lg border-none transition active:scale-95 shadow-md shadow-rose-500/10 uppercase tracking-widest"
                >
                  <span role="img" aria-label="swords">
                    ⚔️
                  </span>{' '}
                  {GRAMMAR_UI_TEXT.analyticsDashboard.sidebarBtnAction}
                </Button>
              </div>
            ) : (
              <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-3 text-center space-y-2">
                <p className="text-[10px] text-emerald-400 leading-relaxed font-bold">
                  {GRAMMAR_UI_TEXT.analyticsDashboard.sidebarPerfectTitle}
                </p>
                <Button
                  onClick={onBack}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[10px] py-2 rounded-lg border-none transition active:scale-95 shadow-md shadow-blue-500/10 uppercase tracking-widest"
                >
                  {GRAMMAR_UI_TEXT.analyticsDashboard.sidebarBtnRoadmap}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
