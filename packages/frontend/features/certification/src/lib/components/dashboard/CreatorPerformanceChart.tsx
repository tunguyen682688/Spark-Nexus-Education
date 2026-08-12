import {
  ChevronDown,
  Info,
  CheckCircle2,
  FileCode,
  Star,
  MessageSquare,
  Heart,
} from 'lucide-react';
import { Card } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface CreatorPerformanceChartProps {
  performanceChart: { dates: string[] };
  activeChartTab: string;
  setActiveChartTab: (tab: string) => void;
  chartTimeframe: string;
  setChartTimeframe: (tf: string) => void;
  currentChartSeries: { data: number[] };
  recentActivity: Array<{
    id: string;
    title: string;
    timestamp: string;
    iconType: string;
    iconBgClass: string;
  }>;
  text: {
    title: string;
    viewAll: string;
  };
}

const tf = CERTIFICATION_UI_TEXT.timeframeOptions;

export const CreatorPerformanceChart = ({
  performanceChart,
  activeChartTab,
  setActiveChartTab,
  chartTimeframe,
  setChartTimeframe,
  currentChartSeries,
  recentActivity,
  text,
}: CreatorPerformanceChartProps) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card className="xl:col-span-2 border-border shadow-sm bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-foreground">
              {text.title}
            </h3>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="relative">
            <select
              value={chartTimeframe}
              onChange={(e) => setChartTimeframe(e.target.value)}
              className="appearance-none bg-background border border-border text-xs font-bold text-foreground py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={tf.last7Days}>{tf.last7Days}</option>
              <option value={tf.last30Days}>{tf.last30Days}</option>
              <option value={tf.thisMonth}>{tf.thisMonth}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[CERTIFICATION_UI_TEXT.chartTabs.attempts, CERTIFICATION_UI_TEXT.chartTabs.averageScore, CERTIFICATION_UI_TEXT.chartTabs.revenue].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveChartTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer ${
                activeChartTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="w-full pt-4 pb-2">
          <div className="relative h-64 w-full">
            {currentChartSeries.data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No data available
              </div>
            ) : (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 55, 110, 165].map((y) => (
                  <line key={y} x1="40" y1={y} x2="680" y2={y} stroke="currentColor" className="text-border/60" strokeDasharray="4 4" />
                ))}

                {(() => {
                  const maxVal = Math.max(...currentChartSeries.data, 1);
                  return [0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                    const val = Math.round(maxVal * frac);
                    const y = 220 - frac * 220;
                    return (
                      <text key={i} x="10" y={y + 4} className="text-[10px] fill-muted-foreground font-semibold">
                        {activeChartTab === 'Revenue' ? `$${val}` : val}
                      </text>
                    );
                  });
                })()}

                {(() => {
                  const data = currentChartSeries.data;
                  const maxVal = Math.max(...data, 1);
                  const points: Array<{ x: number; y: number; val: string }> = data.map((v, i) => ({
                    x: 50 + i * (600 / Math.max(data.length - 1, 1)),
                    y: 220 - (v / maxVal) * 220,
                    val: activeChartTab === 'Revenue'
                      ? `$${v}`
                      : activeChartTab === 'Average Score'
                        ? `${v}%`
                        : v.toLocaleString(),
                  }));

                  const polyPts = points.map((p) => `${p.x},${p.y}`).join(' ') + ` ${points[points.length - 1]?.x ?? 50},220 50,220`;
                  const linePath = points.length > 1
                    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
                    : '';

                  return (
                    <>
                      <polygon points={polyPts} fill="url(#chartGradient)" />
                      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                      {points.map((pt, idx) => (
                        <g key={idx}>
                          <circle cx={pt.x} cy={pt.y} r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                          <text x={pt.x} y={pt.y - 12} textAnchor="middle" className="text-[10px] font-black fill-indigo-600 dark:fill-indigo-400">
                            {pt.val}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}

                {performanceChart.dates.map((date, idx) => (
                  <text
                    key={date}
                    x={50 + idx * (600 / Math.max(performanceChart.dates.length - 1, 1))}
                    y="235"
                    textAnchor="middle"
                    className="text-[10px] fill-muted-foreground font-semibold"
                  >
                    {date}
                  </text>
                ))}
              </svg>
            )}
          </div>
        </div>
      </Card>

      <Card className="border-border shadow-sm bg-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-extrabold text-base text-foreground">
            {text.viewAll ? 'Recent Activity' : 'Recent Activity'}
          </h3>
          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
            {text.viewAll}
          </button>
        </div>

        <div className="space-y-4">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBgClass}`}
              >
                {item.iconType === 'check' && <CheckCircle2 className="w-4 h-4" />}
                {item.iconType === 'document' && <FileCode className="w-4 h-4" />}
                {item.iconType === 'star' && <Star className="w-4 h-4" />}
                {item.iconType === 'comment' && <MessageSquare className="w-4 h-4" />}
                {item.iconType === 'heart' && <Heart className="w-4 h-4 fill-current" />}
              </div>

              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-foreground leading-snug">{item.title}</p>
                <span className="text-[10px] text-muted-foreground font-medium block">
                  {item.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
