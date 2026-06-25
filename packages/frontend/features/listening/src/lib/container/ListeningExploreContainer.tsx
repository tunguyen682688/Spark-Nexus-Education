import { useListeningExplore } from '../hooks';
import ListeningCard from '../components/ListeningCard';
import ExploreFiltersSidebar from '../components/ExploreFiltersSidebar';
import ExploreCategoryTabs from '../components/ExploreCategoryTabs';
import {
  ArrowLeft,
  Library,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { LISTENING_ROUTES, LISTENING_EXPLORE_TEXT } from '../constants';

export default function ListeningExploreContainer() {
  const {
    category,
    difficulty,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortedMaterials,
    meta,
    isLoading,
    error,
    handleResetFilters,
    handleDifficultyChange,
    handleCategoryChange,
    navigate,
    isFetchingNextPage,
    loadMoreRef,
  } = useListeningExplore();

  const text = LISTENING_EXPLORE_TEXT;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Back navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Button
              onClick={() => navigate(LISTENING_ROUTES.HUB)}
              className="flex items-center gap-2 text-xs font-bold text-secondary-foreground hover:text-foreground transition-colors bg-secondary hover:bg-secondary/80 px-3.5 py-2 rounded-xl border border-border"
            >
              <ArrowLeft className="w-4 h-4" />
              {text.BACK_TO_HOME}
            </Button>
            <div className="flex items-center gap-3 mt-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-purple-500 bg-clip-text text-transparent">
                  {text.TITLE}
                </h1>
                <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                  {text.SUBTITLE}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Filters & Sắp xếp */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <ExploreFiltersSidebar
            category={category}
            difficulty={difficulty}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            handleResetFilters={handleResetFilters}
            handleDifficultyChange={handleDifficultyChange}
          />

          {/* RIGHT CONTENT: GRID MATERIALS & CATEGORIES TABS */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Category tabs */}
            <ExploreCategoryTabs
              category={category}
              handleCategoryChange={handleCategoryChange}
            />

            {/* Info bar results counts */}
            <div className="flex items-center justify-between text-xs text-slate-455 font-bold px-2">
              <span>{text.SHOWING_COUNT(sortedMaterials.length, meta.total)}</span>
              {difficulty !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full border border-purple-500/20 text-purple-400 bg-purple-500/5 uppercase text-[9px] font-black">
                  {text.LEVEL_PREFIX}{difficulty}
                </span>
              )}
            </div>

            {/* Main Materials Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40 text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-xs font-extrabold animate-pulse uppercase tracking-wider">{text.LOADING_DATA}</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-400 border border-red-500/10 bg-red-500/5 rounded-3xl font-bold text-xs">
                {text.ERROR_TITLE}
              </div>
            ) : sortedMaterials.length === 0 ? (
              <div className="text-center py-32 bg-slate-900/20 border border-slate-850 rounded-3xl text-slate-500 space-y-4">
                <Library className="w-12 h-12 text-slate-650 mx-auto" />
                <p className="text-xs font-bold">{text.EMPTY_TITLE}</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-400 hover:text-purple-300 text-xs font-extrabold rounded-xl transition-all"
                >
                  {text.RESET_FILTERS_CTA}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedMaterials.map((material) => (
                    <ListeningCard
                      key={material.id}
                      material={material}
                      onClick={(id) => navigate(LISTENING_ROUTES.STUDY(id))}
                      onDictationClick={(id) => navigate(LISTENING_ROUTES.WORKSPACE.DICTATION(id))}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                <div ref={loadMoreRef} className="h-4 w-full" />

                {/* Fetching Next Page Loader */}
                {isFetchingNextPage && (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
