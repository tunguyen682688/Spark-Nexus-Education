import {
  Heart,
  Filter,
  ChevronDown,
  Grid,
  List,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { useFavoritesContainerLogic } from '../../hooks/container-logic/library/use-favorites-container-logic';
import { FavoriteCard } from '../../components/library/FavoriteCard';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { Pagination } from '../../components/shared/Pagination';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export const CertificationFavoritesContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    totalCount,
    allFavoritesCount,
    items,
    categoryBreakdown,
    handleOpenItem,
    handleRemoveFavorite,
    handleBackToLearning,
  } = useFavoritesContainerLogic();

  const text = CERTIFICATION_UI_TEXT.favorites;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.favorites} onRetry={refetch} />;
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <button
            onClick={handleBackToLearning}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            {text.breadcrumbParent}
          </button>
          <span>&gt;</span>
          <span className="text-foreground font-bold">{text.breadcrumbCurrent}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Heart className="w-7 h-7 text-rose-500 fill-current" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
            </div>
            <Badge className="bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-extrabold text-sm px-2.5 py-0.5 rounded-full border-none">
              {allFavoritesCount} Items
            </Badge>
          </div>

          {/* TOP CONTROLS */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="text-xs font-bold py-2 px-3 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              {text.filterBtn}
            </Button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating' | 'name')}
                className="appearance-none bg-background border border-border hover:border-rose-500/50 text-xs font-bold text-foreground py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer h-9"
              >
                <option value="recent">{text.sortOptions.recent}</option>
                <option value="rating">{text.sortOptions.rating}</option>
                <option value="name">{text.sortOptions.name}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {text.subtitle}
        </p>
      </div>

      {/* 2. MAIN LAYOUT GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: SEARCH, TABS & FAVORITE CARDS */}
        <div className="xl:col-span-2 space-y-6">
          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 border border-border rounded-xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.searchPlaceholder}
                className="pl-8 text-xs bg-background py-2 h-9 rounded-xl"
              />
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TYPE TABS */}
          <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {[
                { id: 'All', label: `All (${allFavoritesCount})` },
                { id: 'Collections', label: 'Collections' },
                { id: 'Tests', label: 'Tests' },
                { id: 'Questions', label: 'Questions' },
                { id: 'Vocabulary', label: 'Vocabulary' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-rose-600 font-extrabold border-b-2 border-rose-600 rounded-b-none'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAVORITE CARDS GRID OR EMPTY STATE */}
          {items.length === 0 ? (
            <Card className="border-border p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-foreground">{text.emptyState.title}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {text.emptyState.description}
                </p>
              </div>
              <Button
                onClick={handleBackToLearning}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                {text.emptyState.exploreBtn}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((item) => (
                <FavoriteCard
                  key={item.id}
                  item={item}
                  onOpenItem={handleOpenItem}
                  onRemoveFavorite={handleRemoveFavorite}
                />
              ))}
            </div>
          )}

          {/* PAGINATION FOOTER */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalCount}
            pageSize={pageSize}
          />
        </div>

        {/* RIGHT 1 COLUMN: SIDEBAR WIDGETS */}
        <div className="space-y-6">
          {/* WIDGET 1: FAVORITES BY CATEGORY */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>{text.widgets.categoryTitle}</span>
                <Heart className="w-4 h-4 text-rose-500 fill-current" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {categoryBreakdown.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 text-xs font-semibold"
                >
                  <span className="text-foreground">{c.label}</span>
                  <Badge className="bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-extrabold border-none text-[10px]">
                    {c.count} items
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* WIDGET 2: AI RECOMMENDATION */}
          <Card className="border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900/40 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h5 className="font-extrabold text-xs text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                  {text.widgets.quickPracticeTitle}
                </h5>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {text.widgets.quickPracticeDesc}
              </p>
              <Button className="w-full text-xs font-bold py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer">
                {text.widgets.practiceBtn}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
