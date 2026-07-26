import React from 'react';
import {
  CheckCircle2,
  Filter,
  ChevronDown,
  Grid,
  List,
  ArrowRight,
  ShieldCheck,
  Star,
  Award,
  Clock,
  BookOpen,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { useCompletedCollectionsContainerLogic } from '../hooks/useCompletedCollectionsContainerLogic';
import { CompletedCollectionCard } from '../components/CompletedCollectionCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { Pagination } from '../components/Pagination';
import { CertificateModal } from '../components/CertificateModal';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

export const CertificationCompletedCollectionsContainer: React.FC = () => {
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
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
            </div>
            <Badge className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm px-2.5 py-0.5 rounded-full border-none">
              {totalCount}
            </Badge>
          </div>

          {/* TOP CONTROLS */}
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

      {/* 2. TOP METRIC CARDS ROW (5 METRICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* METRIC 1: COMPLETED SETS */}
        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.completedSets}
            </span>
            <div className="text-xl font-black text-foreground">{computedMetrics.completedSetsCount}</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              {text.metrics.finishRate}
            </span>
          </div>
        </Card>

        {/* METRIC 2: AVG ACCURACY */}
        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.avgAccuracy}
            </span>
            <div className="text-xl font-black text-foreground">
              {computedMetrics.avgAccuracyStr}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
              {text.metrics.monthlyImprovement}
            </span>
          </div>
        </Card>

        {/* METRIC 3: CERTIFICATES ISSUED */}
        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.certificatesIssued}
            </span>
            <div className="text-xl font-black text-foreground">
              {computedMetrics.certificatesCount}
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
              {text.metrics.verifiedDownloadable}
            </span>
          </div>
        </Card>

        {/* METRIC 4: TOTAL PRACTICE TIME */}
        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.totalPracticeTime}
            </span>
            <div className="text-xl font-black text-foreground">
              {computedMetrics.totalPracticeTimeStr}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {text.metrics.loggedTime}
            </span>
          </div>
        </Card>

        {/* METRIC 5: MOCKS MASTERED */}
        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card col-span-2 sm:col-span-1 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.mocksMastered}
            </span>
            <div className="text-xl font-black text-foreground">
              {computedMetrics.mocksMasteredCount}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {text.metrics.mockTestsLabel}
            </span>
          </div>
        </Card>
      </div>

      {/* 3. MAIN LAYOUT GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: CATEGORY TABS & CARDS GRID */}
        <div className="xl:col-span-2 space-y-6">
          {/* CATEGORY TABS & VIEW TOGGLE */}
          <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {[
                { id: 'All', label: `All (${totalCount})` },
                { id: 'IELTS', label: 'IELTS' },
                { id: 'TOEIC', label: 'TOEIC' },
                { id: 'Listening', label: 'Listening' },
                { id: 'Reading', label: 'Reading' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-600 rounded-b-none'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* COMPLETED COLLECTION CARDS GRID OR EMPTY STATE */}
          {collections.length === 0 ? (
            <Card className="border-border p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-foreground">{text.emptyState.title}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {text.emptyState.description}
                </p>
              </div>
              <Button
                onClick={handleBackToLearning}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                {text.emptyState.exploreBtn}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {collections.map((item) => (
                <CompletedCollectionCard
                  key={item.id}
                  item={item}
                  onOpenCollection={handleOpenCollection}
                  onViewCertificate={(id, e) => handleViewCertificate(id, e)}
                  onViewAnalytics={handleViewAnalytics}
                />
              ))}
            </div>
          )}

          {/* PAGINATION FOOTER */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalCount}
            pageSize={pageSize}
          />
        </div>

        {/* RIGHT 1 COLUMN: SIDEBAR WIDGETS */}
        <div className="space-y-6">
          {/* WIDGET 1: CERTIFICATES & RECOGNITION */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">
                {text.widgets.certificatesTitle} ({certificatesList.length})
              </CardTitle>
              <button
                onClick={handleExploreMoreExams}
                className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
              >
                {text.widgets.viewAllBtn}
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificatesList.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                  Chưa có chứng chỉ được cấp. Hãy hoàn thành bài thi để nhận chứng chỉ!
                </div>
              ) : (
                certificatesList.slice(0, 3).map((cert) => (
                  <div
                    key={cert.id}
                    onClick={() => handleViewCertificate(cert.id)}
                    className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 flex items-center justify-between cursor-pointer hover:border-purple-400 transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Award className="w-5 h-5 text-purple-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-xs text-purple-950 dark:text-purple-200 truncate">
                          {cert.title}
                        </h5>
                        <span className="text-[10px] text-purple-700 dark:text-purple-300 font-mono">
                          {cert.issuedDate} • {cert.score}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold flex-shrink-0">
                      PDF
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* WIDGET 2: RECOMMENDATION / NEXT STEPS BOX */}
          <Card className="border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900/40 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h5 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  {text.widgets.readyTitle}
                </h5>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {text.widgets.readyDesc}
              </p>
              <Button
                onClick={handleExploreMoreExams}
                className="w-full text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                {text.widgets.exploreBtn}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CERTIFICATE MODAL PREVIEW */}
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={handleCloseCertificateModal}
        certificate={selectedCertificate}
        onDownload={handleDownloadCertificate}
      />
    </div>
  );
};
