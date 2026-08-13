import {
  CheckCircle2,
  Filter,
  ChevronDown,
} from 'lucide-react';
import {
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { useCompletedCollectionsContainerLogic } from '../../hooks/container-logic/learning/use-completed-collections-container-logic';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { Pagination } from '../../components/shared/Pagination';
import { CertificateModal } from '../../components/shared/CertificateModal';
import { CompletedCollectionsMetrics } from '../../components/learning/CompletedCollectionsMetrics';
import { CompletedCollectionsTabs } from '../../components/learning/CompletedCollectionsTabs';
import { CompletedCollectionsGrid } from '../../components/learning/CompletedCollectionsGrid';
import { CompletedCollectionsSidebar } from '../../components/learning/CompletedCollectionsSidebar';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export const CertificationCompletedCollectionsContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    totalCount,
    collections,
    certificatesList,
    computedMetrics,
    selectedCertificate,
    isCertificateModalOpen,
    handleOpenCollection,
    handleViewCertificate,
    handleDownloadCertificate,
    handleCloseCertificateModal,
    handleCopyCode,
    handleViewAnalytics,
    handleBackToLearning,
    handleExploreMoreExams,
  } = useCompletedCollectionsContainerLogic();

  const text = CERTIFICATION_UI_TEXT.completedCollections;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.completedCollections} onRetry={refetch} />;
  }

  return (
    <div className="w-full space-y-6 pb-12">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <button onClick={handleBackToLearning} className="hover:text-foreground transition-colors cursor-pointer">
            {text.breadcrumbParent}
          </button>
          <span>{'>'}</span>
          <span className="text-foreground font-bold">{text.breadcrumbCurrent}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
            </div>
            <Badge className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm px-2.5 py-0.5 rounded-full border-none">
              {totalCount}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-xs font-bold py-2 px-3 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer">
              <Filter className="w-3.5 h-3.5" />
              {text.filterBtn}
            </Button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'score' | 'time')}
                className="appearance-none bg-background border border-border hover:border-indigo-500/50 text-xs font-bold text-foreground py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-9"
              >
                <option value="recent">{text.sortOptions.recent}</option>
                <option value="score">{text.sortOptions.score}</option>
                <option value="time">{text.sortOptions.time}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {text.subtitle}
        </p>
      </div>

      <CompletedCollectionsMetrics
        computedMetrics={computedMetrics}
        totalCount={totalCount}
        text={text}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
<CompletedCollectionsTabs
          totalCount={totalCount}
          activeTab={activeTab}
          setActiveTab={(tab: string) => setActiveTab(tab as any)}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          text={text}
        />

          <CompletedCollectionsGrid
            collections={collections}
            viewMode={viewMode}
            onOpenCollection={handleOpenCollection}
            onViewCertificate={handleViewCertificate}
            onViewAnalytics={(id, e) => handleViewAnalytics(id, e)}
            onBackToLearning={handleBackToLearning}
            text={text}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalCount}
            pageSize={pageSize}
          />
        </div>

        <CompletedCollectionsSidebar
          certificatesList={certificatesList}
          onViewCertificate={handleViewCertificate}
          onExploreMoreExams={handleExploreMoreExams}
          text={text}
        />
      </div>

      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={handleCloseCertificateModal}
        certificate={selectedCertificate}
        onDownload={handleDownloadCertificate}
        onCopyCode={(code) => handleCopyCode(code)}
        copied={false}
      />
    </div>
  );
};