import React from 'react';
import { Card, CardContent, Progress } from '@spark-nest-ed/frontend-shared-components';
import { Search, BookOpen, Clock, Award } from 'lucide-react';
import type { UserReadingStats } from '../../types';

interface ReadingStatsBarProps {
  stats: UserReadingStats;
}

export const ReadingStatsBar: React.FC<ReadingStatsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Words Looked Up */}
      <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1 transition-colors">
              <Search className="h-3 w-3" /> Words Looked Up
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">{stats.wordsLookedUp}</h3>
            <span className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded transition-colors">
              +12% this week
            </span>
          </div>
          {/* Mini Sparkline Graph */}
          <div className="w-16 h-10 text-emerald-400 dark:text-emerald-500">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path
                d="M0,35 Q15,30 30,20 T60,25 T90,5 L100,5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Total Articles */}
      <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1 transition-colors">
              <BookOpen className="h-3 w-3" /> Total Articles
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">{stats.totalArticles}</h3>
            <span className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded transition-colors">
              +4 new
            </span>
          </div>
          {/* Mini Sparkline Graph */}
          <div className="w-16 h-10 text-blue-400 dark:text-blue-500">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <path
                d="M0,30 Q20,38 40,25 T80,10 T100,2"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Avg. Speed (WPM) */}
      <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1 transition-colors">
              <Clock className="h-3 w-3" /> Avg. Speed (WPM)
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">{stats.avgWpm}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium transition-colors">Target: 290 WPM</p>
          </div>
          {/* Speed Indicator Arc */}
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500 dark:text-blue-400"
                strokeDasharray={`${Math.min(100, (stats.avgWpm / 290) * 100)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors">
              {Math.round((stats.avgWpm / 290) * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Mastery Level */}
      <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
        <CardContent className="p-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1 transition-colors">
                <Award className="h-3 w-3" /> Mastery Level
              </p>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full transition-colors">
                {stats.masteryLevel}
              </span>
            </div>
            {/* CEFR level scale progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase transition-colors">
                <span>A1</span>
                <span>B2</span>
                <span>C2</span>
              </div>
              <Progress
                value={
                  stats.masteryLevel === 'A1'
                    ? 16
                    : stats.masteryLevel === 'A2'
                    ? 33
                    : stats.masteryLevel === 'B1'
                    ? 50
                    : stats.masteryLevel === 'B2'
                    ? 66
                    : stats.masteryLevel === 'C1'
                    ? 83
                    : stats.masteryLevel === 'C2'
                    ? 100
                    : 66
                }
                className="h-1.5 bg-slate-100 dark:bg-slate-800"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
