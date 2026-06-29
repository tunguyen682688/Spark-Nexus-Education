import { FC } from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, Target } from 'lucide-react';
import { GRAMMAR_UI_TEXT } from '../../constants';

interface AnalyticsStatsGridProps {
  masteryPercentage: number;
  totalTraps: number;
  trappedCount: number;
  brokenCount: number;
  accuracyRate: number;
}

export const AnalyticsStatsGrid: FC<AnalyticsStatsGridProps> = ({
  masteryPercentage,
  totalTraps,
  trappedCount,
  brokenCount,
  accuracyRate,
}) => {
  return (
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
  );
};
