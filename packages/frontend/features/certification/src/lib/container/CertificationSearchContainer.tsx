import React from 'react';
import { ArrowRight, List, Grid } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { useSearchContainerLogic } from '../hooks/useSearchContainerLogic';
import { ListSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

export const CertificationSearchContainer: React.FC = () => {
  const {
    searchKeyword,
    activeResultTab,
    isListViewMode,
    setIsListViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    searchResults,
    paginatedSearchResults,
    resultTabOptions,
    isLoading,
    isError,
    error,
    refetch,
    handleSearchKeywordChange,
    handleResultTabChange,
    handleViewCollectionDetail,
  } = useSearchContainerLogic();

  if (isError) {
    return (
      <div className="w-full py-12 flex justify-center">
        <div className="w-full max-w-xl">
          <ErrorState
            onRetry={refetch}
            message={
              error instanceof Error
                ? error.message
                : CERTIFICATION_UI_TEXT.error.collections
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. SEARCH BAR & HEADER */}
      <div className="space-y-4 border-b border-border pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {CERTIFICATION_UI_TEXT.search.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {CERTIFICATION_UI_TEXT.search.subtitlePrefix} "{searchKeyword}"
            </p>
          </div>

          <div className="w-full md:max-w-md relative">
            <input
              type="text"
              placeholder={CERTIFICATION_UI_TEXT.search.inputPlaceholder}
              value={searchKeyword}
              onChange={(e) => handleSearchKeywordChange(e.target.value)}
              className="w-full text-xs pl-4 pr-10 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* RESULT CATEGORY TABS */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {resultTabOptions.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleResultTabChange(tab.key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 flex-shrink-0 ${
                  activeResultTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                    : 'bg-accent/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeResultTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-accent text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsListViewMode(true)}
              className={`p-1.5 rounded-lg border ${
                isListViewMode
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20'
                  : 'border-border text-muted-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsListViewMode(false)}
              className={`p-1.5 rounded-lg border ${
                !isListViewMode
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20'
                  : 'border-border text-muted-foreground'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE SEARCH RESULTS */}
      {isLoading ? (
        <div className="space-y-4">
          <ListSkeleton />
          <ListSkeleton />
          <ListSkeleton />
        </div>
      ) : searchResults.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          {CERTIFICATION_UI_TEXT.search.noResultsPrefix} "{searchKeyword}"
          {CERTIFICATION_UI_TEXT.search.noResultsSuffix}
        </div>
      ) : (
        <>
          <div
            className={
              isListViewMode
                ? 'space-y-4'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            }
          >
            {paginatedSearchResults.map((collectionItem) => (
              <Card
                key={collectionItem.id}
                className="hover:shadow-md transition-all duration-300 border-border group"
              >
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-none font-bold text-[10px]">
                        {collectionItem.exam || 'CERTIFICATION'}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-semibold">
                        <span role="img" aria-label="rating star">
                          ⭐
                        </span>{' '}
                        {collectionItem.rating || '4.9'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-foreground group-hover:text-indigo-600 transition-colors">
                      {collectionItem.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {collectionItem.desc ||
                        collectionItem.subtitle ||
                        'High frequency practice tests with AI feedback.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() =>
                        handleViewCollectionDetail(collectionItem.id)
                      }
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      {CERTIFICATION_UI_TEXT.common.viewCollection}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={searchResults.length}
            pageSize={pageSize}
          />
        </>
      )}
    </div>
  );
};
