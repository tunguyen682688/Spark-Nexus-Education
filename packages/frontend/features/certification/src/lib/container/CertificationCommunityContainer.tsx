import { useCommunityContainerLogic } from '../hooks/useCommunityContainerLogic';
import { CommunityStatsHeaderCard } from '../components/CommunityStatsHeaderCard';
import { CommunityFilterBar } from '../components/CommunityFilterBar';
import { CommunityContributorsCard } from '../components/CommunityContributorsCard';
import { CommunityCollectionCard } from '../components/CommunityCollectionCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

interface CertificationCommunityContainerProps {
  onStartExam?: (examId: string) => void;
}

export const CertificationCommunityContainer = ({ onStartExam }: 
  CertificationCommunityContainerProps
) => {
  const {
    selectedCommunitySortFilter,
    selectedExamCategory,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    topContributors,
    filteredCommunityCollections,
    paginatedCommunityCollections,
    communityHighlightStats,
    handleCommunitySortFilterChange,
    handleExamCategoryChange,
    handleViewCollectionDetail,
  } = useCommunityContainerLogic(onStartExam);

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
      {/* 1. TITLE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            {CERTIFICATION_UI_TEXT.community.title}{' '}
            <span role="img" aria-label="community">
              👥
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {CERTIFICATION_UI_TEXT.community.subtitle}
          </p>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <CommunityStatsHeaderCard stats={communityHighlightStats} />

      {/* 3. FILTER BAR */}
      <CommunityFilterBar
        selectedSortFilter={selectedCommunitySortFilter}
        selectedCategory={selectedExamCategory}
        onSortFilterChange={handleCommunitySortFilterChange}
        onCategoryChange={handleExamCategoryChange}
      />

      {/* 4. DYNAMIC COMMUNITY CARDS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredCommunityCollections.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          {CERTIFICATION_UI_TEXT.community.noMatchFilter}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCommunityCollections.map((collectionItem) => (
              <CommunityCollectionCard
                key={collectionItem.id}
                item={collectionItem}
                onStart={handleViewCollectionDetail}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredCommunityCollections.length}
            pageSize={pageSize}
          />
        </>
      )}

      {/* 5. TOP CONTRIBUTORS ROW */}
      <CommunityContributorsCard contributors={topContributors} />
    </div>
  );
};
