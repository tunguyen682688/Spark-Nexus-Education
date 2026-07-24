import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useOfficialContainerLogic } from '../hooks/useOfficialContainerLogic';
import { OfficialCollectionCard } from '../components/OfficialCollectionCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import {
  CERTIFICATION_UI_TEXT,
  OFFICIAL_EXAM_CATEGORIES,
  DIFFICULTY_LEVEL_OPTIONS,
} from '../constants/certification.constants';

interface CertificationOfficialContainerProps {
  onStartExam?: (examId: string) => void;
}

export const CertificationOfficialContainer: React.FC<CertificationOfficialContainerProps> = ({
  onStartExam,
}) => {
  const {
    selectedExamCategory,
    selectedDifficultyLevel,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    filteredOfficialCollections,
    paginatedOfficialCollections,
    isLoading,
    isError,
    error,
    refetch,
    handleExamCategoryChange,
    handleDifficultyLevelChange,
    handleViewCollectionDetail,
  } = useOfficialContainerLogic(onStartExam);

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
      {/* 1. TITLE & SUBTITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            {CERTIFICATION_UI_TEXT.officialCollections.title}{' '}
            <CheckCircle2 className="w-6 h-6 text-blue-500 fill-current" />
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {CERTIFICATION_UI_TEXT.officialCollections.subtitle}
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

      {/* 3. DYNAMIC OFFICIAL COLLECTIONS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredOfficialCollections.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
          {CERTIFICATION_UI_TEXT.officialCollections.noMatchFilter}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedOfficialCollections.map((collectionItem) => (
              <OfficialCollectionCard
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
            totalItems={filteredOfficialCollections.length}
            pageSize={pageSize}
          />
        </>
      )}
    </div>
  );
};
