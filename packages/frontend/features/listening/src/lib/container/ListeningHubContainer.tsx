import { useListeningHub } from '../hooks';
import ListeningCard from '../components/ListeningCard';
import HubStatsRow from '../components/HubStatsRow';
import HubChallengeCard from '../components/HubChallengeCard';
import HubLeaderboard from '../components/HubLeaderboard';
import HubBanner from '../components/HubBanner';
import HubFilterToolbar from '../components/HubFilterToolbar';
import HubTrendingCarousel from '../components/HubTrendingCarousel';
import HubPodcastsCarousel from '../components/HubPodcastsCarousel';
import HubExamsCarousel from '../components/HubExamsCarousel';
import HubVideosCarousel from '../components/HubVideosCarousel';
import HubCommunitySection from '../components/HubCommunitySection';
import { Loader2, Library } from 'lucide-react';
import { LISTENING_ROUTES, LISTENING_HUB_TEXT } from '../constants';

export default function ListeningHubContainer() {
  const {
    navigate,
    trendingScrollRef,
    podcastsScrollRef,
    examsScrollRef,
    videosScrollRef,
    communityScrollRef,
    selectedDifficulty,
    setSelectedDifficulty,
    searchQuery,
    setSearchQuery,
    isCommunity,
    setIsCommunity,
    isLoadingList,
    listError,
    allItems,
    handleScroll,
    displayStreak,
    displayTotalMinutes,
    displayCompletedLessons,
    dailyTargetMinutes,
    dailyProgressPercent,
    isSearchActive,
    podcasts,
    exams,
    videos,
    communityItems,
    trendingItems,
    dailyChallengeItem,
    handleResetSearch,
    handleNavigateContribute,
    leaderboardData,
    isLoadingLeaderboard,
  } = useListeningHub();

  const text = LISTENING_HUB_TEXT;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-full mx-auto space-y-8">
        
        {/* Banner Section */}
        <HubBanner
          onNavigate={navigate}
          onNavigateContribute={handleNavigateContribute}
        />

        {/* Global Toolbar Filters */}
        <HubFilterToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          isCommunity={isCommunity}
          setIsCommunity={setIsCommunity}
        />

        {/* LOADING & ERROR LAYOUT */}
        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-sm font-semibold animate-pulse">{text.LOADING}</p>
          </div>
        ) : listError ? (
          <div className="text-center py-20 text-red-400 border border-red-500/10 bg-red-500/5 rounded-2xl">
            {text.ERROR}
          </div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/10 border border-slate-800 rounded-3xl text-slate-500">
            {text.EMPTY}
          </div>
        ) : isSearchActive ? (
          
          /* SEARCH / FILTER ACTIVE: SHOW CONCISE GRID RESULTS */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Library className="w-5 h-5 text-purple-500" />
                {text.SEARCH_RESULTS(allItems.length)}
              </h2>
              <button
                onClick={handleResetSearch}
                className="text-xs text-purple-400 hover:underline"
              >
                {text.RESET_SEARCH_CTA}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allItems.map((material) => (
                <ListeningCard
                  key={material.id}
                  material={material}
                  onClick={(id) => navigate(LISTENING_ROUTES.STUDY(id))}
                  onDictationClick={(id) => navigate(LISTENING_ROUTES.WORKSPACE.DICTATION(id))}
                />
              ))}
            </div>
          </div>
        ) : (
          
          /* DASHBOARD MODE: RICH DIVERSITY MULTI-COMPONENT LAYOUT */
          <div className="space-y-12">
            
            {/* 1. PERSONAL STATS ROW */}
            <HubStatsRow
              displayStreak={displayStreak}
              displayTotalMinutes={displayTotalMinutes}
              displayCompletedLessons={displayCompletedLessons}
              dailyTargetMinutes={dailyTargetMinutes}
              dailyProgressPercent={dailyProgressPercent}
            />

            {/* 2. TWO-COLUMN LAYOUT: MAIN CONTENT AREA & SIDEBAR GAMIFICATION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: TRENDING & CATEGORIES CATALOGS */}
              <div className="lg:col-span-2 space-y-12 overflow-hidden">
                
                {/* A. TRENDING / XU HƯỚNG CAROUSEL */}
                <HubTrendingCarousel
                  trendingItems={trendingItems}
                  trendingScrollRef={trendingScrollRef}
                  handleScroll={handleScroll}
                  navigate={navigate}
                />

                {/* B. PODCASTS & AUDIO SECTION */}
                <HubPodcastsCarousel
                  podcasts={podcasts}
                  podcastsScrollRef={podcastsScrollRef}
                  handleScroll={handleScroll}
                  navigate={navigate}
                />

                {/* C. EXAMS SECTION */}
                <HubExamsCarousel
                  exams={exams}
                  examsScrollRef={examsScrollRef}
                  handleScroll={handleScroll}
                  navigate={navigate}
                />

                {/* D. YOUTUBE VIDEO SECTION */}
                <HubVideosCarousel
                  videos={videos}
                  videosScrollRef={videosScrollRef}
                  handleScroll={handleScroll}
                  navigate={navigate}
                />

                {/* E. COMMUNITY CONTRIBUTIONS */}
                <HubCommunitySection
                  communityItems={communityItems}
                  communityScrollRef={communityScrollRef}
                  handleScroll={handleScroll}
                  navigate={navigate}
                  handleNavigateContribute={handleNavigateContribute}
                />

              </div>

              {/* RIGHT COLUMN: GAMIFIED WIDGETS (SIDEBAR) */}
              <div className="space-y-8">
                
                {/* 1. DAILY RECOMMENDED CHALLENGE */}
                {dailyChallengeItem && (
                  <HubChallengeCard
                    dailyChallengeItem={dailyChallengeItem}
                    onClick={(id) => navigate(LISTENING_ROUTES.STUDY(id))}
                  />
                )}

                {/* 2. WEEKLY LEADERBOARD WIDGET */}
                <HubLeaderboard
                  selectedDifficulty={selectedDifficulty}
                  displayTotalMinutes={displayTotalMinutes}
                  leaderboardData={leaderboardData}
                  isLoading={isLoadingLeaderboard}
                />

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
