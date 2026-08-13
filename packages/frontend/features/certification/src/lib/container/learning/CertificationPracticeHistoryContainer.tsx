import {
  Clock,
  Filter,
  ChevronDown,
} from 'lucide-react';
import {
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { usePracticeHistoryContainerLogic } from '../../hooks/container-logic/learning/use-practice-history-container-logic';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { PracticeHistoryFilterBar } from '../../components/learning/PracticeHistoryFilterBar';
import { PracticeHistoryStats } from '../../components/learning/PracticeHistoryStats';
import { PracticeHistoryList } from '../../components/learning/PracticeHistoryList';

export const CertificationPracticeHistoryContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    selectedTypeFilter,
    setSelectedTypeFilter,
    selectedExamFilter,
    setSelectedExamFilter,
    selectedSkillFilter,
    setSelectedSkillFilter,
    activeCategoryTab,
    setActiveCategoryTab,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    sessions,
    handleViewScorecard,
    handleRetakeTest,
    handleBackToLearning,
  } = usePracticeHistoryContainerLogic();

  const text = CERTIFICATION_UI_TEXT.practiceHistory;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.practiceHistory} onRetry={refetch} />;
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
              <Clock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
            </div>
            <Badge className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm px-2.5 py-0.5 rounded-full border-none">
              {sessions.length} Sessions
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
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="appearance-none bg-background border border-border hover:border-indigo-500/50 text-xs font-bold text-foreground py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-9"
              >
                <option value="all">{text.sortOptions.all}</option>
                <option value="Full Mock">{text.sortOptions.fullMock}</option>
                <option value="Practice Part">{text.sortOptions.practicePart}</option>
                <option value="Quiz">{text.sortOptions.quiz}</option>
                <option value="AI Practice">{text.sortOptions.ai}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {text.subtitle}
        </p>
      </div>

      {/* 2. TOP METRICS ROW (5 KPI CARDS) */}
      <PracticeHistoryStats
        sessionsCount={sessions.length}
        text={text}
      />

      {/* 3. MAIN CONTENT (2 COLUMNS) */}
      <PracticeHistoryFilterBar
        selectedTypeFilter={selectedTypeFilter}
        setSelectedTypeFilter={setSelectedTypeFilter}
        selectedExamFilter={selectedExamFilter}
        setSelectedExamFilter={setSelectedExamFilter}
        selectedSkillFilter={selectedSkillFilter}
        setSelectedSkillFilter={setSelectedSkillFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategoryTab={activeCategoryTab}
        setActiveCategoryTab={(tab: string) => setActiveCategoryTab(tab as any)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sessionsCount={sessions.length}
        text={text}
      />

      <PracticeHistoryList
        sessions={sessions}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        handleViewScorecard={handleViewScorecard}
        handleRetakeTest={(id: string) => handleRetakeTest(id, {} as React.MouseEvent)}
        handleBackToLearning={handleBackToLearning}
        text={text}
      />
    </div>
  );
};
