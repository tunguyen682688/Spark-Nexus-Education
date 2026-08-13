import {
  ShoppingBag,
  Filter,
  ChevronDown,
} from 'lucide-react';
import {
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { usePurchasedCollectionsContainerLogic } from '../../hooks/container-logic/library/use-purchased-collections-container-logic';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { PurchasedStatsRow } from '../../components/library/PurchasedStatsRow';
import { PurchasedFilterBar } from '../../components/library/PurchasedFilterBar';
import { PurchasedGrid } from '../../components/library/PurchasedGrid';

export const CertificationPurchasedCollectionsContainer = () => {
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
    items,
    handleOpenCollection,
    handleViewReceipt,
    handleBackToLearning,
  } = usePurchasedCollectionsContainerLogic();

  const text = CERTIFICATION_UI_TEXT.purchasedCollections;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.purchasedCollections} onRetry={refetch} />;
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
              <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
            </div>
            <Badge className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm px-2.5 py-0.5 rounded-full border-none">
              {items.length} Packages
            </Badge>
          </div>

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
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'price' | 'progress')}
                className="appearance-none bg-background border border-border hover:border-indigo-500/50 text-xs font-bold text-foreground py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-9"
              >
                <option value="recent">{text.sortOptions.recent}</option>
                <option value="price">{text.sortOptions.price}</option>
                <option value="progress">{text.sortOptions.progress}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {text.subtitle}
        </p>
      </div>

      {/* 2. TOP METRIC CARDS ROW (5 METRICS) */}
      <PurchasedStatsRow
        items={items}
        text={text}
      />

      {/* 3. MAIN LAYOUT GRID (2 COLUMNS) */}
      <PurchasedFilterBar
        activeTab={activeTab}
        setActiveTab={(tab: string) => setActiveTab(tab as any)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        itemsCount={items.length}
        text={text}
      />

      <PurchasedGrid
        items={items}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        handleOpenCollection={handleOpenCollection}
        handleViewReceipt={(id) => handleViewReceipt(id, {} as React.MouseEvent)}
        handleBackToLearning={handleBackToLearning}
        text={text}
      />
    </div>
  );
};
