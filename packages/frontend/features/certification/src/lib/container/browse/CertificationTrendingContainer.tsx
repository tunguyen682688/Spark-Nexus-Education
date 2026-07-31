import { useTrendingContainerLogic } from '../../hooks/container-logic/browse/use-trending-container-logic';
import { TrendingCollectionCard } from '../../components/exam/TrendingCollectionCard';
import { TrendingLeaderboardCard } from '../../components/exam/TrendingLeaderboardCard';
import { WhyTrendingCard } from '../../components/exam/WhyTrendingCard';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { Pagination } from '../../components/shared/Pagination';
import {
  CERTIFICATION_UI_TEXT,
  OFFICIAL_EXAM_CATEGORIES,
  DIFFICULTY_LEVEL_OPTIONS,
} from '../../constants/certification.constants';

interface CertificationTrendingContainerProps {
  onStartExam?: (examId: string) => void;
}

export const CertificationTrendingContainer = ({ onStartExam }: 
  CertificationTrendingContainerProps
) => {
  const {
    selectedExamCategory,
    selectedDifficultyLevel,
    bookmarkedCollectionIds,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    filteredTrendingCollections,
    paginatedTrendingCollections,
    whyTrendingReasons,
    isLoading,
    isError,
    error,
    refetch,
    handleViewCollectionDetail,
    handleExamCategoryChange,
    handleDifficultyLevelChange,
    toggleCollectionBookmark,
  } = useTrendingContainerLogic(onStartExam);

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
      {/* 1. HEADER TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            {CERTIFICATION_UI_TEXT.trending.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {CERTIFICATION_UI_TEXT.trending.subtitle}
          </p>
        </div>
      </div>

      {/* 2. FILTER PILLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {OFFICIAL_EXAM_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleExamCategoryChange(category)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                selectedExamCategory === category
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                  : 'bg-accent/40 text-muted-foreground hover:text-foreground hover:bg-accent/60'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDifficultyLevel}
            onChange={(e) => handleDifficultyLevelChange(e.target.value)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
          >
            {DIFFICULTY_LEVEL_OPTIONS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. TRENDING COLLECTION CARDS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <CardSkeleton key={idx} />
          ))}
        </div>
      ) : filteredTrendingCollections.length === 0 ? (
        <div className="col-span-full text-center py-10 text-xs text-muted-foreground font-semibold border border-dashed rounded-xl">
          {CERTIFICATION_UI_TEXT.trending.noMatchFilter}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {paginatedTrendingCollections.map((collectionItem) => (
              <TrendingCollectionCard
                key={collectionItem.id}
                item={collectionItem}
                onStart={handleViewCollectionDetail}
                onBookmark={(id) => toggleCollectionBookmark(id)}
                isBookmarked={bookmarkedCollectionIds.includes(
                  collectionItem.id
                )}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredTrendingCollections.length}
            pageSize={pageSize}
          />
        </>
      )}

      {/* 4. BOTTOM SECTIONS: TRENDING LEADERBOARD & WHY TRENDING CARD */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4">
        <TrendingLeaderboardCard
          collections={filteredTrendingCollections}
          bookmarkedCollectionIds={bookmarkedCollectionIds}
          onBookmark={toggleCollectionBookmark}
        />
        <WhyTrendingCard reasons={whyTrendingReasons} />
      </div>
    </div>
  );
};
