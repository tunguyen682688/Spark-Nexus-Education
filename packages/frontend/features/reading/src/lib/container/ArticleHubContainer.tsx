import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReadingDashboard,
  useArticles,
  useCommunityArticles,
} from '../hooks/use-reading';
import { TrendingPublications } from '../components/dashboard/TrendingPublications';
import { ReadingStatsBar } from '../components/dashboard/ReadingStatsBar';
import { BookNook } from '../components/dashboard/BookNook';
import { Blogosphere } from '../components/dashboard/Blogosphere';
import { ReadingStreakCard } from '../components/dashboard/ReadingStreakCard';
import { READING_UI_TEXT } from '../constants';
import { TrendingTopics } from '../components/dashboard/TrendingTopics';
import { RecentLookups } from '../components/dashboard/RecentLookups';
import { ArticleFilterBar } from '../components/shared/ArticleFilterBar';
import { ArticleCard } from '../components/shared/ArticleCard';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import {
  Skeleton,
  Input,
  Button,
} from '@spark-nest-ed/frontend-shared-components';
import { Search, Compass, Users, BookOpen, PenLine } from 'lucide-react';

export const ArticleHubContainer: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    category?: string;
    difficulty?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch dashboard aggregate data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
  } = useReadingDashboard();

  // Prepare query parameters for discover articles list
  const queryParams = {
    page: 1,
    pageSize: 6,
    sortBy: activeFilters.sortBy,
    sortOrder: activeFilters.sortOrder,
    q: searchTerm || undefined,
    filters: {
      category: activeFilters.category || undefined,
      difficulty: activeFilters.difficulty || undefined,
      status: activeFilters.status || undefined,
    },
  };

  // Fetch discover articles
  const {
    data: discoverData,
    isLoading: isDiscoverLoading,
    isError: isDiscoverError,
  } = useArticles(queryParams);

  // Fetch community articles
  const [communitySort, setCommunitySort] = useState<
    'trending' | 'newest' | 'top'
  >('trending');
  const {
    data: communityData,
    isLoading: isCommunityLoading,
  } = useCommunityArticles(communitySort, 10);

  const [activeTab, setActiveTab] = useState<'official' | 'community'>(
    'official'
  );

  const handleFilterChange = (newFilters: Partial<typeof activeFilters>) => {
    setActiveFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const isPageLoading = isDashboardLoading || isDiscoverLoading;

  if (isDashboardError || isDiscoverError) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-red-600">
          {READING_UI_TEXT.hub.FAILED_LOAD}
        </h3>
        <p className="text-slate-500">
          {READING_UI_TEXT.hub.CHECK_CONNECTION}
        </p>
        <Button onClick={() => window.location.reload()}>{READING_UI_TEXT.hub.RETRY}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4 md:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/20">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight transition-colors">
              {READING_UI_TEXT.hub.TITLE}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">
              {READING_UI_TEXT.hub.SUBTITLE}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-80 flex items-center"
          >
            <Search className="absolute left-3 text-slate-400 dark:text-slate-500 h-4 w-4" />
            <Input
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm((e.target as HTMLInputElement).value)
              }
              placeholder={READING_UI_TEXT.hub.SEARCH_PLACEHOLDER}
              className="pl-9 h-9 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 text-xs w-full bg-slate-50/50 dark:bg-slate-800/50 dark:text-slate-200 rounded-lg transition-colors"
            />
          </form>
          <Button onClick={() => navigate(ROUTES.READING.STUDIO)} className="gap-2 shrink-0 h-9 px-4 text-xs font-semibold">
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">{READING_UI_TEXT.hub.CREATE_STUDIO}</span>
          </Button>
        </div>
      </div>

      {isPageLoading ? (
        // Skeleton Skeletons Skeletons Loading
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl dark:bg-slate-800" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-lg dark:bg-slate-800" />
            <Skeleton className="h-24 rounded-lg dark:bg-slate-800" />
            <Skeleton className="h-24 rounded-lg dark:bg-slate-800" />
            <Skeleton className="h-24 rounded-lg dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-64 rounded-xl dark:bg-slate-800" />
              <Skeleton className="h-64 rounded-xl dark:bg-slate-800" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-48 rounded-xl dark:bg-slate-800" />
              <Skeleton className="h-48 rounded-xl dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ) : (
        dashboardData && (
          <div className="space-y-6">
            {/* 1. Trending Publications */}
            <TrendingPublications
              publications={dashboardData.trendingPublications}
            />

            {/* 2. Reading Stats Bar */}
            <ReadingStatsBar stats={dashboardData.stats} />

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Book Nook, Blogosphere, Discover Articles */}
              <div className="lg:col-span-8 space-y-6">
                {/* 3. Book Nook */}
                <BookNook books={dashboardData.bookNook} />

                {/* 4. Blogosphere */}
                <Blogosphere articles={dashboardData.blogosphere} />

                {/* 5. Discover Articles Filter Bar & Grid */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <button
                      onClick={() => setActiveTab('official')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        activeTab === 'official'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      {READING_UI_TEXT.hub.TAB_OFFICIAL}
                    </button>
                    <button
                      onClick={() => setActiveTab('community')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        activeTab === 'community'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      {READING_UI_TEXT.hub.TAB_COMMUNITY}
                    </button>
                  </div>

                  {activeTab === 'official' && (
                    <>
                      <ArticleFilterBar
                        onFilterChange={handleFilterChange}
                        activeCategory={activeFilters.category || ''}
                      />

                      {discoverData && discoverData.data.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {discoverData.data.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50/50 backdrop-blur-md dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 p-12 text-center rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                            <BookOpen className="w-8 h-8 text-slate-400" />
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            {READING_UI_TEXT.hub.NO_MATCHES}
                          </h4>
                          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                            {READING_UI_TEXT.hub.NO_MATCHES_SUB}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'community' && (
                    <div className="space-y-4">
                      <div className="flex justify-end space-x-2 mb-4">
                        {(['trending', 'newest', 'top'] as const).map(
                          (sort) => (
                            <button
                              key={sort}
                              onClick={() => setCommunitySort(sort)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                                communitySort === sort
                                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                              }`}
                            >
                              {sort}
                            </button>
                          )
                        )}
                      </div>

                      {isCommunityLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Skeleton className="h-48 rounded-xl dark:bg-slate-800" />
                          <Skeleton className="h-48 rounded-xl dark:bg-slate-800" />
                        </div>
                      ) : communityData && communityData.data.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {communityData.data.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 backdrop-blur-md dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/50 dark:border-indigo-900/30 p-12 text-center rounded-3xl shadow-sm transition-all flex flex-col items-center justify-center space-y-4">
                          <div className="w-20 h-20 bg-white/60 dark:bg-slate-900/60 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/20 rounded-full flex items-center justify-center mb-2">
                            <Users className="w-10 h-10 text-indigo-500" />
                          </div>
                          <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            {READING_UI_TEXT.hub.NO_COMMUNITY}
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm max-w-sm">
                            {READING_UI_TEXT.hub.NO_COMMUNITY_SUB}
                          </p>
                          <Button className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 border-0 rounded-full px-8">
                            {READING_UI_TEXT.hub.EXPLORE_MORE}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sidebar (Streak, Topics, Lookups) */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                {/* Streak */}
                <ReadingStreakCard streak={dashboardData.readingStreak} />

                {/* Trending Topics */}
                <TrendingTopics
                  topics={dashboardData.trendingTopics}
                  onTopicClick={(topic) =>
                    handleFilterChange({ category: topic.toLowerCase() })
                  }
                />

                {/* Recent Lookups */}
                <RecentLookups lookups={dashboardData.recentLookups} />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
export default ArticleHubContainer;
