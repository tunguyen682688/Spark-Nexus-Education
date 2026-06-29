import React from 'react';
import { Skeleton, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { Clock, BookOpen, CheckCircle2, TrendingUp, History, PlayCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ARTICLE_THUMBNAIL } from '@spark-nest-ed/frontend-core-constants';
import { useHistoryContainer } from '../hooks/use-history-container';
import { READING_UI_TEXT } from '../constants/reading-ui-text';

export const HistoryContainer: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, isLoading, isError } = useHistoryContainer();

  if (isLoading) {
    return (
      <div className="w-full p-4 md:p-8 min-h-screen bg-background font-sans space-y-8 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 dark:bg-slate-800" />
          <Skeleton className="h-4 w-96 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28 rounded-2xl dark:bg-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-8 w-32 dark:bg-slate-800" />
            <Skeleton className="h-64 rounded-2xl dark:bg-slate-800" />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-8 w-48 dark:bg-slate-800" />
            <Skeleton className="h-48 rounded-2xl dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="w-full p-8 min-h-screen bg-background font-sans flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{READING_UI_TEXT.history.ERROR_TITLE}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {READING_UI_TEXT.history.ERROR_DESC}
        </p>
      </div>
    );
  }

  const { stats, inProgress, history } = dashboardData;

  return (
    <div className="w-full p-4 md:p-8 min-h-screen bg-background font-sans space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <History className="h-8 w-8 text-blue-600 dark:text-blue-500" />
          {READING_UI_TEXT.history.TITLE}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {READING_UI_TEXT.history.SUBTITLE}
        </p>
      </div>

      {/* Grid Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white dark:bg-[#121826] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{READING_UI_TEXT.history.STAT_LOOKED_UP}</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-0.5">{stats.wordsLookedUp}</h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white dark:bg-[#121826] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{READING_UI_TEXT.history.STAT_COMPLETED}</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-0.5">{READING_UI_TEXT.history.STAT_COMPLETED_VAL.replace('{count}', stats.totalArticles.toString())}</h3>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white dark:bg-[#121826] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{READING_UI_TEXT.history.STAT_AVG_SPEED}</span>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-0.5">
              {stats.avgWpm > 0 ? stats.avgWpm : '--'} <span className="text-sm text-slate-400 font-medium">WPM</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Workspace split into two sections: History Timeline & In Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Detailed History List (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-400" />
            {READING_UI_TEXT.history.DETAIL_TITLE}
          </h2>

          <div className="bg-white dark:bg-[#121826] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
            {!history || history.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <History className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-medium">{READING_UI_TEXT.history.EMPTY_TITLE}</p>
                <p className="text-xs text-slate-500">{READING_UI_TEXT.history.EMPTY_DESC}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {history.map((item, idx) => (
                  <div key={item.id} className="p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-200">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Thumbnail wrapper or CEFR indicator circle */}
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs border border-white/10 overflow-hidden relative shadow-sm">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-tr from-slate-700 to-slate-900" />
                        )}
                        <span className="relative z-10">{item.level}</span>
                      </div>

                      {/* Text details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1 leading-snug hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" onClick={() => navigate(`/reading/article/${item.id}`)}>
                          {item.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">
                          {item.timeAgo}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge & Button */}
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={`border-none font-bold text-[9px] uppercase tracking-wide px-2 py-0.5 rounded ${
                        item.status === 'MASTERED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                      }`}>
                        {item.status === 'MASTERED' ? READING_UI_TEXT.history.STATUS_MASTERED : READING_UI_TEXT.history.STATUS_LEARNING}
                      </Badge>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/reading/article/${item.id}`)}
                        className="h-8 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-lg border-none"
                      >
                        {READING_UI_TEXT.history.BTN_REPLAY}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: In Progress Items (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-slate-400" />
            {READING_UI_TEXT.history.IN_PROGRESS_TITLE}
          </h2>

          <div className="space-y-4">
            {!inProgress || inProgress.length === 0 ? (
              <div className="bg-white dark:bg-[#121826] rounded-2xl p-6 border border-slate-100 dark:border-white/5 text-center text-slate-400 text-xs">
                {READING_UI_TEXT.history.IN_PROGRESS_EMPTY}
              </div>
            ) : (
              inProgress.map((item) => (
                <div key={item.id} className="bg-white dark:bg-[#121826] rounded-2xl border border-slate-100 dark:border-white/5 p-4 shadow-sm space-y-3 hover:shadow-md transition-all duration-300">
                  <div className="flex gap-3 items-start">
                    {/* Tiny Thumbnail */}
                    <div className="h-12 w-16 shrink-0 bg-slate-900 rounded-lg overflow-hidden relative shadow-sm border border-white/5">
                      <img src={item.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                    {/* Text Title */}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block mt-1">
                        {item.category} • {item.readTimeStr}
                      </span>
                    </div>
                  </div>

                  {/* Progress Info */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      <span>{READING_UI_TEXT.history.PROGRESS_LABEL}</span>
                      <span className="text-blue-600 dark:text-blue-400">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>

                  {/* Continue Button */}
                  <Button
                    onClick={() => navigate(`/reading/article/${item.id}`)}
                    className="w-full h-8 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg border-none flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {READING_UI_TEXT.history.BTN_CONTINUE}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryContainer;
