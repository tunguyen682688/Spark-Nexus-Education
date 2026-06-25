import React from 'react';
import { Card, CardContent } from '@spark-nest-ed/frontend-shared-components';
import { Flame } from 'lucide-react';
import type { ReadingStreak } from '../../types';
import { READING_UI_TEXT } from '../../constants';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface ReadingStreakCardProps {
  streak: ReadingStreak;
}

export const ReadingStreakCard: React.FC<ReadingStreakCardProps> = ({ streak }) => {
  return (
    <Card className="border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-gradient-to-br from-amber-50/20 to-orange-50/10 dark:from-amber-900/10 dark:to-orange-900/5 transition-colors">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 transition-colors">
          <div className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 flex items-center justify-center transition-colors">
            <Flame className="h-4 w-4 fill-current animate-pulse" />
          </div>
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 tracking-tight transition-colors">{READING_UI_TEXT.components.dashboard.STREAK_TITLE}</h3>
        </div>

        {/* Days circle list */}
        <div className="flex justify-between items-center px-1">
          {streak.weeklyActivity.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                  day.active
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-300 dark:shadow-amber-900/20 ring-2 ring-amber-100 dark:ring-amber-900/50'
                    : day.future
                    ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                )}
              >
                {day.label}
              </div>
            </div>
          ))}
        </div>

        {/* Description text */}
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors">
          <span className="font-extrabold text-amber-600 dark:text-amber-500">{READING_UI_TEXT.components.dashboard.STREAK_TEXT.replace('{streak}', streak.currentStreak.toString())}</span> {READING_UI_TEXT.components.dashboard.STREAK_SUBTEXT}
          it up to reach your weekly goal.
        </p>
      </CardContent>
    </Card>
  );
};
