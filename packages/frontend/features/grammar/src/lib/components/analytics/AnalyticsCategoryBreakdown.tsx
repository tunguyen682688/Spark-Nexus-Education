import { FC } from 'react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../../constants';
import type { TrapCategoryItem } from '../../types';

interface AnalyticsCategoryBreakdownProps {
  trapCategories: TrapCategoryItem[];
  trappedCount: number;
  onNavigateToTraps: () => void;
}

export const AnalyticsCategoryBreakdown: FC<AnalyticsCategoryBreakdownProps> = ({
  trapCategories,
  trappedCount,
  onNavigateToTraps,
}) => {
  return (
    <div className="w-full lg:w-80 bg-muted/30 border border-border/80 rounded-2xl p-5 space-y-5">
      <div className="space-y-0.5">
        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
          {GRAMMAR_UI_TEXT.analyticsDashboard.decompositionLabel}
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
              onClick={onNavigateToTraps}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] py-2 rounded-lg border-none transition active:scale-95 shadow-md shadow-rose-500/10 uppercase tracking-widest"
            >
              <span role="img" aria-label="swords">
                ⚔️
              </span>{' '}
              {GRAMMAR_UI_TEXT.analyticsDashboard.sidebarBtnAction}
            </Button>
          </div>
        ) : (
          <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-3 text-center">
            <p className="text-[10px] text-emerald-455 leading-relaxed font-extrabold">
              {GRAMMAR_UI_TEXT.analyticsDashboard.sidebarPerfectTitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
