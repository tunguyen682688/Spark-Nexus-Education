import { FC } from 'react';
import { TrendingUp } from 'lucide-react';
import { GRAMMAR_UI_TEXT } from '../../constants';
import type { XPTrendItem } from '../../types';

interface AnalyticsXpChartProps {
  xpTrend: XPTrendItem[];
  hoveredPointIdx: number | null;
  onHoverPoint: (idx: number | null) => void;
}

export const AnalyticsXpChart: FC<AnalyticsXpChartProps> = ({
  xpTrend,
  hoveredPointIdx,
  onHoverPoint,
}) => {
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
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y =
              paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
            const value = Math.round(maxXp - ratio * xpRange);
            return (
              <g key={ratio} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-500 text-[9px] font-mono font-bold"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Chart paths */}
          {points.length > 1 && (
            <>
              <path d={areaPath} fill="url(#chartAreaGrad)" />
              <path
                d={linePath}
                fill="none"
                stroke="url(#chartLineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => onHoverPoint(idx)}
              onMouseLeave={() => onHoverPoint(null)}
              className="cursor-pointer"
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPointIdx === idx ? '6' : '3.5'}
                className={`transition-all duration-150 ${
                  hoveredPointIdx === idx
                    ? 'fill-indigo-400 stroke-background stroke-2 shadow-lg'
                    : 'fill-blue-500 stroke-background stroke-1.5'
                }`}
              />
              {/* Highlight Vertical Line on Hover */}
              {hoveredPointIdx === idx && (
                <line
                  x1={p.x}
                  y1={paddingTop}
                  x2={p.x}
                  y2={chartHeight - paddingBottom}
                  stroke="#4f46e5"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  className="opacity-70 pointer-events-none"
                />
              )}
            </g>
          ))}

          {/* X Axis labels */}
          {points.map((p, idx) => {
            // Show first, middle, last labels to prevent overlapping
            const shouldShow =
              idx === 0 ||
              idx === points.length - 1 ||
              (points.length > 5 && idx === Math.floor(points.length / 2));
            if (!shouldShow) return null;

            return (
              <text
                key={idx}
                x={p.x}
                y={chartHeight - 10}
                textAnchor="middle"
                className="fill-slate-500 text-[9px] font-bold uppercase tracking-wider"
              >
                {p.dayName}
              </text>
            );
          })}
        </svg>

        {/* Dynamic Tooltip representation overlay */}
        {hoveredPointIdx !== null && points[hoveredPointIdx] && (
          <div
            className="absolute bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl shadow-2xl space-y-0.5 pointer-events-none transition-all duration-100 ease-out z-20"
            style={{
              left: `${(points[hoveredPointIdx].x / chartWidth) * 100}%`,
              top: `${(points[hoveredPointIdx].y / chartHeight) * 100 - 30}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <span className="text-[8px] font-black text-slate-500 block uppercase tracking-wider">
              {points[hoveredPointIdx].date}
            </span>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span className="text-xs font-black text-white">
                {points[hoveredPointIdx].xp} XP
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
