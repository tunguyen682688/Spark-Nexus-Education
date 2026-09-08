import { LibraryFilterBar } from '../../components/library/LibraryFilterBar';
import { SavedCollectionsPanel } from '../../components/library/SavedCollectionsPanel';
import { InProgressSessionsPanel } from '../../components/library/InProgressSessionsPanel';
import { ExamHistoryPanel } from '../../components/library/ExamHistoryPanel';
import { MyClonesPanel } from '../../components/library/MyClonesPanel';
import { MyCollectionsPanel } from '../../components/library/MyCollectionsPanel';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface LibraryContentSectionProps {
  activeTab: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedExamFilter: string;
  setSelectedExamFilter: (f: string) => void;
  sortBy: string;
  setSortBy: (s: 'recent' | 'title') => void;
  savedCollections: Array<{
    id: string;
    title: string;
    description?: string;
    subtitle?: string;
    exam: string;
    examCount?: number;
    itemsCount?: number;
    level?: string;
  }>;
  isLoadingSaved: boolean;
  isErrorSaved: boolean;
  refetchSaved: () => void;
  inProgressSessions: Array<{
    id: string;
    examId: string;
    title?: string;
    examTitle: string;
    timeAgo: string;
    totalQuestions: number;
  }>;
  isLoadingInProgress: boolean;
  isErrorInProgress: boolean;
  refetchInProgress: () => void;
  practiceHistoryItems: Array<{
    id: string;
    title: string;
    scoreSub: string;
    scoreDisplay: string;
    dateDisplay: string;
    timeSpent: string;
  }>;
  isLoadingHistory: boolean;
  isErrorHistory: boolean;
  refetchHistory: () => void;
  clonedCollections: Array<{
    id: string;
    title: string;
    description?: string;
    examCount: number;
    itemCount: number;
  }>;
  isLoadingCloned: boolean;
  isErrorCloned: boolean;
  refetchCloned: () => void;
  myCollections: Array<{
    id: string;
    title: string;
    description?: string;
    examCount?: number;
    itemCount?: number;
    publishStatus?: string;
  }>;
  isLoadingMyCollections: boolean;
  isErrorMyCollections: boolean;
  refetchMyCollections: () => void;
  handleUnbookmark: (id: string, e: React.MouseEvent) => void;
  handleOpenCollection: (id: string) => void;
  handleStartExam: (id: string, e?: React.MouseEvent) => void;
  handleBackToDashboard: () => void;
  libText: typeof CERTIFICATION_UI_TEXT.library;
}

export const LibraryContentSection = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  selectedExamFilter,
  setSelectedExamFilter,
  sortBy,
  setSortBy,
  savedCollections,
  isLoadingSaved,
  isErrorSaved,
  refetchSaved,
  inProgressSessions,
  isLoadingInProgress,
  isErrorInProgress,
  refetchInProgress,
  practiceHistoryItems,
  isLoadingHistory,
  isErrorHistory,
  refetchHistory,
  clonedCollections,
  isLoadingCloned,
  isErrorCloned,
  refetchCloned,
  myCollections,
  isLoadingMyCollections,
  isErrorMyCollections,
  refetchMyCollections,
  handleUnbookmark,
  handleOpenCollection,
  handleStartExam,
  handleBackToDashboard,
  libText,
}: LibraryContentSectionProps) => {
  return (
    <>
      <LibraryFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedExamFilter={selectedExamFilter}
        setSelectedExamFilter={setSelectedExamFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        searchPlaceholder={libText.searchPlaceholder}
      />

      {activeTab === 'saved' && (
        <SavedCollectionsPanel
          collections={savedCollections}
          isLoading={isLoadingSaved}
          isError={isErrorSaved}
          refetch={refetchSaved}
          onOpenCollection={handleOpenCollection}
          onStartExam={handleStartExam}
          onUnbookmark={handleUnbookmark}
          onBackToDashboard={handleBackToDashboard}
          text={libText}
        />
      )}

      {activeTab === 'in_progress' && (
        <InProgressSessionsPanel
          sessions={inProgressSessions}
          isLoading={isLoadingInProgress}
          isError={isErrorInProgress}
          refetch={refetchInProgress}
          onStartExam={handleStartExam}
          text={libText}
        />
      )}

      {activeTab === 'history' && (
        <ExamHistoryPanel
          items={practiceHistoryItems}
          isLoading={isLoadingHistory}
          isError={isErrorHistory}
          refetch={refetchHistory}
          onStartExam={handleStartExam}
          text={libText}
        />
      )}

      {activeTab === 'my_clones' && (
        <MyClonesPanel
          collections={clonedCollections}
          isLoading={isLoadingCloned}
          isError={isErrorCloned}
          refetch={refetchCloned}
          onOpenCollection={handleOpenCollection}
          text={libText}
        />
      )}

      {activeTab === 'my_collections' && (
        <MyCollectionsPanel
          collections={myCollections}
          isLoading={isLoadingMyCollections}
          isError={isErrorMyCollections}
          refetch={refetchMyCollections}
          onOpenCollection={handleOpenCollection}
          text={libText}
        />
      )}
    </>
  );
};
