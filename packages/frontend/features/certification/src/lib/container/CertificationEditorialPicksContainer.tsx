import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { useEditorialPicksContainerLogic } from '../hooks/useEditorialPicksContainerLogic';
import { EditorialPicksHeader } from '../components/EditorialPicksHeader';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import {
  CERTIFICATION_UI_TEXT,
  EDITORIAL_LEVEL_FILTERS,
  EXAM_CATEGORY_OPTIONS,
} from '../constants/certification.constants';

export const CertificationEditorialPicksContainer: React.FC = () => {
  const {
    selectedLevelFilter,
    selectedExamCategory,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    topEditorialBadges,
    filteredEditorialPicks,
    paginatedEditorialPicks,
    handleLevelFilterChange,
    handleExamCategoryChange,
    handleViewCollectionDetail,
  } = useEditorialPicksContainerLogic();

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
      {/* 1 & 2. HERO TITLE & TOP BADGES */}
      <EditorialPicksHeader badges={topEditorialBadges} />

      {/* 3. FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {EDITORIAL_LEVEL_FILTERS.map((level) => (
            <button
              key={level}
              onClick={() => handleLevelFilterChange(level)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                selectedLevelFilter === level
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                  : 'bg-accent/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedExamCategory}
            onChange={(e) => handleExamCategoryChange(e.target.value)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
          >
            {EXAM_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. DYNAMIC EDITORIAL PICKS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredEditorialPicks.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          {CERTIFICATION_UI_TEXT.editorialPicks.noMatchFilter}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEditorialPicks.map((collectionItem) => (
              <Card
                key={collectionItem.id}
                className="hover:shadow-md transition-all duration-300 border-border group relative overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-indigo-600 text-white border-none font-bold">
                      {collectionItem.tag || "Editor's Choice"}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-bold">
                      {collectionItem.exam}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-foreground line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {collectionItem.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {collectionItem.desc ||
                        collectionItem.subtitle ||
                        'Selected by exam specialists for fast score gains.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                    <span className="text-muted-foreground font-semibold">
                      <span role="img" aria-label="rating star">
                        ⭐
                      </span>{' '}
                      {collectionItem.rating || '4.9'} (
                      {collectionItem.reviews || '12.6k'})
                    </span>
                    <span className="text-indigo-600 font-bold">
                      {collectionItem.duration || '180 mins'}
                    </span>
                  </div>
                  <Button
                    onClick={() =>
                      handleViewCollectionDetail(collectionItem.id)
                    }
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {CERTIFICATION_UI_TEXT.common.viewCollection}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredEditorialPicks.length}
            pageSize={pageSize}
          />
        </>
      )}
    </div>
  );
};
