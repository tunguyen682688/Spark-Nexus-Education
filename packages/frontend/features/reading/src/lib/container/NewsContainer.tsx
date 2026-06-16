import React from 'react';
import { Button, Skeleton } from '@spark-nest-ed/frontend-shared-components';
import { ChevronLeft, Newspaper, CheckCircle2 } from 'lucide-react';
import { ArticleCard } from '../components/shared/ArticleCard';
import { useNavigate } from 'react-router-dom';
import { useNewsContainer } from '../hooks/use-news-container';
import { READING_UI_TEXT } from '../constants';
import { NewsHeroCard } from '../components/news/NewsHeroCard';
import { NewsFiltersBar } from '../components/news/NewsFiltersBar';
import { ActiveFiltersBadges } from '../components/news/ActiveFiltersBadges';
import { TrendingNewsWidget } from '../components/news/TrendingNewsWidget';
import { CefrBenchmarksWidget } from '../components/news/CefrBenchmarksWidget';
import { ReadingTipsWidget } from '../components/news/ReadingTipsWidget';

export const NewsContainer: React.FC = () => {
  const navigate = useNavigate();
  const {
    page,
    articles,
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeDomain,
    activeTime,
    activeSort,
    tipIndex,
    setTipIndex,
    isLoading,
    error,
    isFetching,
    trendingArticles,
    isTrendingLoading,
    hasMore,
    lastArticleElementRef,
    handleClearFilters,
    handleLevelChange,
    handleDomainChange,
    handleTimeChange,
    handleSortChange,
    handleQuickTagClick,
  } = useNewsContainer();

  const renderArticlesGrid = () => {
    const heroArticle = articles[0];
    const otherArticles = articles.slice(1);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {heroArticle && (
            <NewsHeroCard article={heroArticle} onTagClick={handleQuickTagClick} />
          )}
          {otherArticles.map((article) => (
            <div key={article.id} className="col-span-1">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate('/reading/explore')}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-6 group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {READING_UI_TEXT.news.BACK_TO_EXPLORE}
      </button>

      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-bold uppercase tracking-wider">
            <Newspaper className="h-4 w-4 animate-pulse" />
            <span>{READING_UI_TEXT.news.EXPLORER_SUBTITLE}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {READING_UI_TEXT.news.TITLE}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">
            {READING_UI_TEXT.news.DESCRIPTION}
          </p>
        </div>
      </div>

      {/* Search & Filters Container */}
      <NewsFiltersBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeLevel={activeLevel}
        handleLevelChange={handleLevelChange}
        activeDomain={activeDomain}
        handleDomainChange={handleDomainChange}
        activeTime={activeTime}
        handleTimeChange={handleTimeChange}
        activeSort={activeSort}
        handleSortChange={handleSortChange}
        handleClearFilters={handleClearFilters}
      />

      {/* Active Badges & Popular suggest tags Row */}
      <ActiveFiltersBadges
        activeLevel={activeLevel}
        handleLevelChange={handleLevelChange}
        activeDomain={activeDomain}
        handleDomainChange={handleDomainChange}
        activeTime={activeTime}
        handleTimeChange={handleTimeChange}
        handleQuickTagClick={handleQuickTagClick}
      />

      {/* Main Grid Layout (8/12 and 4/12 Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Area: Main News Feed */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading && page === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="w-full h-80 rounded-2xl md:col-span-2" />
              <Skeleton className="w-full h-80 rounded-2xl" />
              <Skeleton className="w-full h-80 rounded-2xl" />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-red-100 dark:border-red-950 p-8 shadow-sm">
              <p className="text-red-500 font-bold mb-2">{READING_UI_TEXT.news.ERROR_LOADING}</p>
              <p className="text-slate-500 text-sm mb-4">
                {(error as Error)?.message || READING_UI_TEXT.news.DEFAULT_ERROR}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg px-6"
              >
                {READING_UI_TEXT.news.RETRY}
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100/80 dark:border-slate-800/80 p-8 shadow-sm">
              <Newspaper className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {READING_UI_TEXT.news.NO_ARTICLES}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2 text-sm leading-relaxed">
                {READING_UI_TEXT.news.NO_ARTICLES_DESC}
              </p>
              <Button
                onClick={handleClearFilters}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-6 py-2 border-none"
              >
                {READING_UI_TEXT.news.RESET_FILTERS}
              </Button>
            </div>
          ) : (
            <>
              {renderArticlesGrid()}

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div
                  ref={lastArticleElementRef}
                  className="h-12 w-full flex justify-center items-center mt-6"
                >
                  {isFetching && (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  )}
                </div>
              )}

              {/* No more articles banner */}
              {!hasMore && articles.length > 0 && (
                <div className="text-center py-8 text-sm text-slate-450 dark:text-slate-500 font-bold border-t border-slate-200/60 dark:border-slate-800/60 mt-8 flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                  {READING_UI_TEXT.news.NO_MORE_NEWS}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Area: Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <TrendingNewsWidget
            trendingArticles={trendingArticles}
            isTrendingLoading={isTrendingLoading}
          />

          <CefrBenchmarksWidget handleLevelChange={handleLevelChange} />

          <ReadingTipsWidget tipIndex={tipIndex} setTipIndex={setTipIndex} />
        </div>
      </div>
    </div>
  );
};
