import { useExamsContainerLogic } from '../hooks/useExamsContainerLogic';
import { FeaturedCollectionCard } from '../components/FeaturedCollectionCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import {
  CERTIFICATION_UI_TEXT,
  EXAM_LIBRARY_CATEGORIES,
} from '../constants/certification.constants';

interface CertificationExamsContainerProps {
  onStartExam?: (examId: string) => void;
}

export const CertificationExamsContainer = ({
  onStartExam,
}: CertificationExamsContainerProps) => {
  const {
    selectedExamCategory,
    collectionSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    examCollections,
    paginatedExamCollections,
    isLoading,
    isError,
    error,
    refetch,
    handleViewCollectionDetail,
    handleExamCategoryChange,
    handleSearchQueryChange,
  } = useExamsContainerLogic(onStartExam);

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
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            {CERTIFICATION_UI_TEXT.examsLibrary.title}
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {CERTIFICATION_UI_TEXT.examsLibrary.subtitle}
          </p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-wrap items-center gap-3">
        {EXAM_LIBRARY_CATEGORIES.map((category) => (
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

        <div className="flex-1 min-w-[200px] relative md:max-w-xs md:ml-auto">
          <input
            type="text"
            placeholder={CERTIFICATION_UI_TEXT.examsLibrary.searchPlaceholder}
            value={collectionSearchQuery}
            onChange={(e) => handleSearchQueryChange(e.target.value)}
            className="w-full text-xs pl-3 pr-8 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* FEATURED EXAM COLLECTIONS GRID */}
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-black tracking-tight">
              {CERTIFICATION_UI_TEXT.examsLibrary.featuredTitle}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {CERTIFICATION_UI_TEXT.examsLibrary.featuredSubtitle}
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <CardSkeleton key={idx} />
              ))}
            </div>
          ) : examCollections.length === 0 ? (
            <div className="col-span-full text-center py-10 text-xs text-muted-foreground font-semibold border border-dashed rounded-xl">
              {CERTIFICATION_UI_TEXT.examsLibrary.noMatchFilter}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {paginatedExamCollections.map((collectionItem) => (
                  <FeaturedCollectionCard
                    key={collectionItem.id}
                    item={collectionItem}
                    onStart={handleViewCollectionDetail}
                  />
                ))}
              </div>

              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={examCollections.length}
                  pageSize={pageSize}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
