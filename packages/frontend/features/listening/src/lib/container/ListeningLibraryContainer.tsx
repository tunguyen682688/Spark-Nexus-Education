import { useListeningLibrary } from '../hooks';
import ListeningCard from '../components/ListeningCard';
import LibraryMasteryCard from '../components/LibraryMasteryCard';
import LibraryWeeklyChart from '../components/LibraryWeeklyChart';
import LibraryAchievementsGrid from '../components/LibraryAchievementsGrid';
import LibraryStreakCard from '../components/LibraryStreakCard';
import LibraryDailyGoalCard from '../components/LibraryDailyGoalCard';
import LibraryStatsSummaryCard from '../components/LibraryStatsSummaryCard';
import LibraryCEFRBreakdownCard from '../components/LibraryCEFRBreakdownCard';
import {
  Bookmark,
  PlayCircle,
  Trophy,
  ArrowLeft,
  BookOpen,
  Trash2,
  Compass,
  Library
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { LISTENING_ROUTES, DAILY_LISTENING_TARGET_MINUTES, LISTENING_LIBRARY_TEXT } from '../constants';

export default function ListeningLibraryContainer() {
  const {
    navigate,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    allItems,
    inProgressItems,
    completedItems,
    bookmarkedItems,
    recentlyStudiedItems,
    handleRemoveBookmark,
    userStats,
    weeklyData,
    achievements,
  } = useListeningLibrary();

  const text = LISTENING_LIBRARY_TEXT;

  // General metrics calculations
  const totalListeningMinutes = Math.round((userStats?.totalTime || 0) / 60);
  const totalCompleted = userStats?.totalMaterials || 0;
  const averageProgress = allItems.length > 0 
    ? Math.round(allItems.reduce((sum, item) => sum + (item.userProgress?.progress || 0), 0) / allItems.length)
    : 0;

  // Level statistics count breakdown
  const getCountByLevel = (lvl: string) => {
    return allItems.filter(item => item.difficulty === lvl && item.userProgress && item.userProgress.progress > 0).length;
  };

  // Today's goal calculations
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const todayName = dayNames[new Date().getDay()];
  const todayMinutes = weeklyData.find((d: { day: string; min: number }) => d.day === todayName)?.min || 0;
  const dailyTarget = DAILY_LISTENING_TARGET_MINUTES;
  const dailyProgressPercent = Math.min(100, Math.round((todayMinutes / dailyTarget) * 100));

  const masteryLevel = userStats?.masteryLevel || 'A1';

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-full mx-auto space-y-8">
        
        {/* Back Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Button
              onClick={() => navigate(LISTENING_ROUTES.HUB)}
              className="flex items-center gap-2 text-xs font-extrabold text-secondary-foreground hover:text-foreground transition-colors bg-secondary hover:bg-secondary/80 border border-border px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              {text.BACK_TO_HUB}
            </Button>
            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5">
                <Library className="w-7 h-7 text-primary animate-pulse" />
                {text.TITLE}
              </h1>
              <p className="text-xs text-muted-foreground font-medium">{text.SUBTITLE}</p>
            </div>
          </div>
        </div>

        {/* TOP ROW: PERSONAL STATS & PROFILE SUMMARY CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Mastery Rank level card */}
          <LibraryMasteryCard masteryLevel={masteryLevel} />

          {/* 🔥 Daily Streak tracker card */}
          <LibraryStreakCard streak={userStats?.streak || 0} />

          {/* Daily Goal Target Ring/Progress */}
          <LibraryDailyGoalCard
            todayMinutes={todayMinutes}
            dailyTarget={dailyTarget}
            dailyProgressPercent={dailyProgressPercent}
          />

        </div>

        {/* MAIN LAYOUT GRID: Left active tabs, Right charts & achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: RECENT & TABS LIST */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recently Studied Section */}
            {recentlyStudiedItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" />
                  {text.RECENTLY_STUDIED.TITLE}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentlyStudiedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(LISTENING_ROUTES.STUDY(item.id))}
                      className="flex bg-card/45 hover:bg-card/70 border border-border hover:border-primary/25 p-3 rounded-2xl transition-all duration-300 cursor-pointer justify-between items-center gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                          {item.thumbnailUrl ? (
                            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-primary/40" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-extrabold text-foreground truncate group-hover:text-primary">{item.title}</h4>
                          <span className="text-[9px] font-bold text-muted-foreground capitalize">
                            {item.category || text.RECENTLY_STUDIED.DEFAULT_CATEGORY} • {item.userProgress?.progress || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] font-black text-primary border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-xl shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {text.RECENTLY_STUDIED.CONTINUE_CTA}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Tabs & Lists */}
            <div className="space-y-6">
              
              {/* Tab Header Selector */}
              <div className="flex border-b border-border/80 pb-0.5 gap-2">
                
                <button
                  onClick={() => setActiveTab('in-progress')}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold border-b-2 transition-all ${
                    activeTab === 'in-progress'
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <PlayCircle className="w-4.5 h-4.5" />
                  {text.TABS.IN_PROGRESS(inProgressItems.length)}
                </button>

                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold border-b-2 transition-all ${
                    activeTab === 'completed'
                      ? 'border-emerald-500 text-emerald-400 font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Trophy className="w-4.5 h-4.5" />
                  {text.TABS.COMPLETED(completedItems.length)}
                </button>

                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold border-b-2 transition-all ${
                    activeTab === 'bookmarks'
                      ? 'border-blue-500 text-blue-400 font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Bookmark className="w-4.5 h-4.5" />
                  {text.TABS.BOOKMARKS(bookmarkedItems.length)}
                </button>

              </div>

              {/* TAB CONTAINER GRID */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
                  <Compass className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-xs font-bold">{text.SYNCING_LIBRARY}</p>
                </div>
              ) : error ? (
                <div className="text-center py-16 text-red-400 border border-red-500/10 bg-red-500/5 rounded-2xl">
                  {text.ERROR_LOADING_LIBRARY}
                </div>
              ) : (
                <>
                  {/* IN PROGRESS TAB */}
                  {activeTab === 'in-progress' && (
                    inProgressItems.length === 0 ? (
                      <div className="text-center py-20 bg-card border border-border border-dashed rounded-3xl text-muted-foreground space-y-3">
                        <PlayCircle className="w-12 h-12 text-slate-700 mx-auto" />
                        <p className="text-xs font-bold">{text.IN_PROGRESS_EMPTY.TITLE}</p>
                        <button
                          onClick={() => navigate(LISTENING_ROUTES.HUB)}
                          className="text-xs text-primary hover:underline font-extrabold flex items-center justify-center gap-1.5 mx-auto"
                        >
                          <Compass className="w-3.5 h-3.5" /> {text.IN_PROGRESS_EMPTY.EXPLORE_CTA}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {inProgressItems.map((item) => (
                          <ListeningCard
                            key={item.id}
                            material={item}
                            onClick={(id) => navigate(LISTENING_ROUTES.STUDY(id))}
                            onDictationClick={(id) => navigate(LISTENING_ROUTES.WORKSPACE.DICTATION(id))}
                          />
                        ))}
                      </div>
                    )
                  )}

                  {/* COMPLETED TAB */}
                  {activeTab === 'completed' && (
                    completedItems.length === 0 ? (
                      <div className="text-center py-20 bg-muted/10 border border-border border-dashed rounded-3xl text-muted-foreground space-y-3">
                        <Trophy className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                        <p className="text-xs font-bold">{text.COMPLETED_EMPTY.TITLE}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold max-w-xs mx-auto">
                          {text.COMPLETED_EMPTY.DESC}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {completedItems.map((item) => (
                          <ListeningCard
                            key={item.id}
                            material={item}
                            onClick={(id) => navigate(LISTENING_ROUTES.STUDY(id))}
                            onDictationClick={(id) => navigate(LISTENING_ROUTES.WORKSPACE.DICTATION(id))}
                          />
                        ))}
                      </div>
                    )
                  )}

                  {/* BOOKMARKS TAB */}
                  {activeTab === 'bookmarks' && (
                    bookmarkedItems.length === 0 ? (
                      <div className="text-center py-20 bg-muted/10 border border-border border-dashed rounded-3xl text-muted-foreground space-y-3">
                        <Bookmark className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                        <p className="text-xs font-bold">{text.BOOKMARKS_EMPTY.TITLE}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold max-w-xs mx-auto">
                          {text.BOOKMARKS_EMPTY.DESC}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookmarkedItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => navigate(LISTENING_ROUTES.STUDY(item.id))}
                            className="group relative flex items-center bg-card/45 hover:bg-card/70 border border-border hover:border-primary/25 p-4 rounded-2xl transition-all duration-300 cursor-pointer gap-4 justify-between"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden border border-border shrink-0 flex items-center justify-center">
                                {item.thumbnailUrl ? (
                                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                  <BookOpen className="w-5 h-5 text-primary/40" />
                                )}
                              </div>

                              <div className="min-w-0 space-y-1">
                                <h3 className="text-xs font-extrabold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                  {item.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                                    item.difficulty === 'A1' || item.difficulty === 'A2'
                                      ? 'border-green-500/30 text-green-400'
                                      : item.difficulty === 'B1' || item.difficulty === 'B2'
                                      ? 'border-blue-500/30 text-blue-400'
                                      : 'border-primary/30 text-primary'
                                    }`}>
                                    {item.difficulty}
                                  </span>
                                  <span>•</span>
                                  <span className="capitalize">{item.category}</span>
                                  <span>•</span>
                                  <span>{item.author || 'Spark Nexus'}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleRemoveBookmark(item.id, e)}
                              className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 active:scale-95 transition-all shrink-0"
                              title={text.BOOKMARK_ITEM.REMOVE_TITLE}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: ANALYTICS & GAMIFICATION SYSTEM */}
          <div className="space-y-6">
            
            {/* WIDGET 1: ANALYTICS DETAIL SUMMARY */}
            <LibraryStatsSummaryCard
              totalListeningMinutes={totalListeningMinutes}
              totalCompleted={totalCompleted}
              averageProgress={averageProgress}
            />

            {/* WIDGET 2: WEEKLY BAR CHART */}
            <LibraryWeeklyChart weeklyData={weeklyData} />

            {/* WIDGET 3: LEVEL BREAKDOWN PROGRESS */}
            <LibraryCEFRBreakdownCard getCountByLevel={getCountByLevel} />

            {/* WIDGET 4: ACHIEVEMENTS / HUY HIỆU ĐẠT ĐƯỢC */}
            <LibraryAchievementsGrid achievements={achievements} />

          </div>

        </div>

      </div>
    </div>
  );
}
