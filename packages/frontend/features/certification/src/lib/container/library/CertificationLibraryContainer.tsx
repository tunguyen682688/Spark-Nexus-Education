import {
  ArrowLeft,
  FolderHeart,
} from 'lucide-react';
import {
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { useLibraryContainerLogic } from '../../hooks/container-logic/library/use-library-container-logic';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { LibraryStatsSection } from '../../components/library/LibraryStatsSection';
import { LibraryTabsSection } from '../../components/library/LibraryTabsSection';
import { LibraryContentSection } from './LibraryContentSection';

export const CertificationLibraryContainer = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedExamFilter,
    setSelectedExamFilter,
    sortBy,
    setSortBy,
    savedCollections,
    totalSavedCount,
    dashboardStats,
    isLoadingSaved,
    isErrorSaved,
    refetchSaved,
    inProgressSessions,
    isLoadingInProgress,
    isErrorInProgress,
    practiceHistoryItems,
    isLoadingHistory,
    isErrorHistory,
    clonedCollections,
    isLoadingCloned,
    isErrorCloned,
    refetchInProgress,
    refetchHistory,
    refetchCloned,
    handleUnbookmark,
    handleOpenCollection,
    handleStartExam,
    handleBackToDashboard,
  } = useLibraryContainerLogic();

  const libText = CERTIFICATION_UI_TEXT.library;

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. TOP NAV & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer border border-border/50 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{libText.backToOverview}</span>
        </button>

        <Badge
          variant="outline"
          className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800"
        >
          <FolderHeart className="w-3.5 h-3.5 mr-1" /> {libText.badgeTitle}
        </Badge>
      </div>

      {/* 2. HERO BANNER & QUICK METRICS */}
      <LibraryStatsSection
        totalSavedCount={totalSavedCount}
        dashboardStats={dashboardStats}
        libText={libText}
      />

      {/* 3. MAIN LIBRARY TAB BAR */}
      <LibraryTabsSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalSavedCount={totalSavedCount}
        libText={libText}
      />

      {/* 4. SEARCH & FILTER BAR + TAB CONTENT */}
      <LibraryContentSection
        activeTab={activeTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedExamFilter={selectedExamFilter}
        setSelectedExamFilter={setSelectedExamFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        savedCollections={savedCollections}
        isLoadingSaved={isLoadingSaved}
        isErrorSaved={isErrorSaved}
        refetchSaved={refetchSaved}
        inProgressSessions={inProgressSessions}
        isLoadingInProgress={isLoadingInProgress}
        isErrorInProgress={isErrorInProgress}
        refetchInProgress={refetchInProgress}
        practiceHistoryItems={practiceHistoryItems}
        isLoadingHistory={isLoadingHistory}
        isErrorHistory={isErrorHistory}
        refetchHistory={refetchHistory}
        clonedCollections={clonedCollections}
        isLoadingCloned={isLoadingCloned}
        isErrorCloned={isErrorCloned}
        refetchCloned={refetchCloned}
        handleUnbookmark={handleUnbookmark}
        handleOpenCollection={handleOpenCollection}
        handleStartExam={handleStartExam}
        handleBackToDashboard={handleBackToDashboard}
        libText={libText}
      />
    </div>
  );
};
