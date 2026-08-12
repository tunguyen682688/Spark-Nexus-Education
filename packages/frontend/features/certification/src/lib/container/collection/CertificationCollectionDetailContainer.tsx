import { ArrowLeft } from 'lucide-react';
import {
  useCollectionDetailContainerLogic,
  CollectionTabType,
} from '../../hooks/container-logic/collection/use-collection-detail-container-logic';
import { useAddCollectionReview } from '../../hooks/use-certification';
import { CollectionDetailHero } from '../../components/collection/CollectionDetailHero';
import { CollectionDetailSidebar } from '../../components/collection/CollectionDetailSidebar';
import { CollectionOverviewTab } from '../../components/collection/CollectionOverviewTab';
import { CollectionContentTab } from '../../components/collection/CollectionContentTab';
import { CollectionStatisticsTab } from '../../components/collection/CollectionStatisticsTab';
import { CollectionReviewsTab } from '../../components/collection/CollectionReviewsTab';
import { CollectionActivityTab } from '../../components/collection/CollectionActivityTab';
import { CollectionRelatedTab } from '../../components/collection/CollectionRelatedTab';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface CertificationCollectionDetailContainerProps {
  collectionId?: string;
  onStartLearning?: (examId: string) => void;
  onBack?: () => void;
}

export const CertificationCollectionDetailContainer = ({ collectionId = 'c1', onStartLearning, onBack }: 
  CertificationCollectionDetailContainerProps
) => {
  const {
    activeTab,
    setActiveTab,
    isCollectionBookmarked,
    isCollectionCloned,
    isLoading,
    isError,
    error,
    refetch,
    isStartingExamSession,
    isSaving,
    isCloning,
    isReporting,
    collectionViewModel,
    contentItems,
    userReviews,
    recentActivities,
    handleToggleBookmark,
    handleToggleClone,
    handleReport,
    handleStartLearning,
    handleStartRelatedCollectionExam,
    relatedCollections,
    isLoadingRelated,
    isOwner,
    handleEditCollection,
    handleBack,
  } = useCollectionDetailContainerLogic(collectionId, onStartLearning);

  const { mutate: addReview, isPending: isSubmittingReview } = useAddCollectionReview();

  const handleSubmitReview = (data: { rating: number; text: string }) => {
    addReview(
      { collectionId: collectionViewModel.id, rating: data.rating, text: data.text },
    );
  };

  if (isError) {
    return (
      <div className="w-full py-12 flex flex-col items-center gap-4">
        <button
          onClick={() => handleBack(onBack)}
          className="self-start inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer border border-border/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
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

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-12">
        <button
          onClick={() => handleBack(onBack)}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer border border-border/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
        <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const navTabItems: Array<{ id: CollectionTabType; label: string }> = [
    { id: 'overview', label: CERTIFICATION_UI_TEXT.collectionDetail.tabs.overview },
    { id: 'content', label: CERTIFICATION_UI_TEXT.collectionDetail.tabs.content },
    { id: 'statistics', label: CERTIFICATION_UI_TEXT.collectionDetail.tabs.statistics },
    { id: 'reviews', label: CERTIFICATION_UI_TEXT.collectionDetail.tabs.reviews },
    { id: 'activity', label: CERTIFICATION_UI_TEXT.collectionDetail.tabs.activity },
    { id: 'related', label: CERTIFICATION_UI_TEXT.collectionDetail.tabs.related },
  ];

  return (
    <div className="w-full space-y-6 pb-12">
      {/* BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => handleBack(onBack)}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer border border-border/50 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      </div>

      {/* 1. HERO HEADER SECTION */}
      <CollectionDetailHero
        collection={collectionViewModel}
        isOwner={isOwner}
        onEditCollection={handleEditCollection}
      />

      {/* 2. TAB NAVIGATION BAR */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
        {navTabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold transition-all duration-200 border-b-2 whitespace-nowrap flex-shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN CONTENT GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: SEPARATED TAB COMPONENTS */}
        <div className="xl:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <CollectionOverviewTab
              contentItems={contentItems}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'content' && (
            <CollectionContentTab
              contentItems={contentItems}
              itemsCount={collectionViewModel.itemsCount}
              isStartingExamSession={isStartingExamSession}
              onStartLearning={handleStartLearning}
            />
          )}

          {activeTab === 'statistics' && (
            <CollectionStatisticsTab
              rating={collectionViewModel.rating}
              reviewsCount={collectionViewModel.reviewsCount}
              downloads={collectionViewModel.downloads}
              clones={collectionViewModel.clones}
              itemsCount={collectionViewModel.itemsCount}
              cefrLevel={collectionViewModel.cefrLevel}
              targetBand={collectionViewModel.targetBand}
              totalSize={collectionViewModel.totalSize}
            />
          )}

          {activeTab === 'reviews' && (
            <CollectionReviewsTab
              userReviews={userReviews}
              reviewsCount={collectionViewModel.reviewsCount}
              onSubmitReview={handleSubmitReview}
              isSubmittingReview={isSubmittingReview}
            />
          )}

          {activeTab === 'activity' && (
            <CollectionActivityTab
              activities={recentActivities}
              isLoading={false}
            />
          )}

          {activeTab === 'related' && (
            <CollectionRelatedTab
              relatedCollections={relatedCollections}
              isLoadingRelated={isLoadingRelated}
              onStartRelatedCollectionExam={handleStartRelatedCollectionExam}
              isStartingExamSession={isStartingExamSession}
            />
          )}
        </div>

        {/* RIGHT COLUMN: SIDEBAR DETAILS */}
        <div>
          <CollectionDetailSidebar
            collection={collectionViewModel}
            isStartingExamSession={isStartingExamSession}
            isSaving={isSaving}
            isCloning={isCloning}
            isReporting={isReporting}
            isCollectionBookmarked={isCollectionBookmarked}
            isCollectionCloned={isCollectionCloned}
            isOwner={isOwner}
            onStartLearning={handleStartLearning}
            onToggleBookmark={handleToggleBookmark}
            onToggleClone={handleToggleClone}
            onReport={handleReport}
            onEditCollection={handleEditCollection}
          />
        </div>
      </div>
    </div>
  );
};
