import {
  Download,
  Filter,
  ChevronDown,
  List,
  Grid,
  HardDrive,
  Trash2,
  FolderArchive,
  Info,
  CheckCircle2,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { useDownloadsContainerLogic } from '../../hooks/container-logic/library/use-downloads-container-logic';
import { DownloadItemRow } from '../../components/library/DownloadItemRow';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { Pagination } from '../../components/shared/Pagination';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export const CertificationDownloadsContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    totalCount,
    allFilesCount,
    files,
    storageMetrics,
    handleOpenFile,
    handleDeleteFile,
    handleClearAll,
    handleBackToLearning,
  } = useDownloadsContainerLogic();

  const text = CERTIFICATION_UI_TEXT.downloads;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.downloads} onRetry={refetch} />;
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
              <Download className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
            </div>
            <Badge className="bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-extrabold text-sm px-2.5 py-0.5 rounded-full border-none">
              {allFilesCount} Files
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
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'size')}
                className="appearance-none bg-background border border-border hover:border-purple-500/50 text-xs font-bold text-foreground py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer h-9"
              >
                <option value="recent">{text.sortOptions.recent}</option>
                <option value="name">{text.sortOptions.name}</option>
                <option value="size">{text.sortOptions.size}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {text.subtitle}
        </p>
      </div>

      {/* 2. MAIN LAYOUT GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: SEARCH, TABS & DOWNLOADS TABLE */}
        <div className="xl:col-span-2 space-y-6">
          {/* SEARCH & ACTION BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 border border-border rounded-xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.searchPlaceholder}
                className="pl-8 text-xs bg-background py-2 h-9 rounded-xl"
              />
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl flex-shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TYPE TABS */}
          <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {[
                { id: 'All', label: `All (${allFilesCount})` },
                { id: 'Tests', label: 'Tests' },
                { id: 'Collections', label: 'Collections' },
                { id: 'Vocabulary', label: 'Vocabulary' },
                { id: 'Reports', label: 'Reports' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-purple-600 font-extrabold border-b-2 border-purple-600 rounded-b-none'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* DOWNLOADS TABLE OR EMPTY STATE */}
          {files.length === 0 ? (
            <Card className="border-border p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto">
                <Download className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-foreground">{text.emptyState.title}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {text.emptyState.description}
                </p>
              </div>
              <Button
                onClick={handleBackToLearning}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                {text.emptyState.exploreBtn}
              </Button>
            </Card>
          ) : (
            <Card className="border-border shadow-sm overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">{text.tableHeaders.name}</th>
                      <th className="py-3 px-4">{text.tableHeaders.type}</th>
                      <th className="py-3 px-4">{text.tableHeaders.downloadedOn}</th>
                      <th className="py-3 px-4">{text.tableHeaders.size}</th>
                      <th className="py-3 px-4">{text.tableHeaders.expires}</th>
                      <th className="py-3 px-4 text-right">{text.tableHeaders.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-medium text-foreground">
                    {files.map((file) => (
                      <DownloadItemRow
                        key={file.id}
                        file={file}
                        onOpenFile={handleOpenFile}
                        onDeleteFile={handleDeleteFile}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
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
          {/* WIDGET 1: STORAGE USAGE METER */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-600" />
                {text.widgets.storageTitle}
              </CardTitle>
              <span className="text-xs font-black text-purple-600">
                {storageMetrics.usedMB} MB / {storageMetrics.maxGB} GB
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${storageMetrics.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                {text.widgets.remainingStorage}
              </p>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  className="w-full text-xs font-bold py-2 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {text.widgets.clearAllBtn}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* WIDGET 2: DOWNLOAD TIPS & SECURITY */}
          <Card className="border-purple-200 bg-purple-50/40 dark:bg-purple-950/20 dark:border-purple-900/40 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h5 className="font-extrabold text-xs text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  {text.widgets.rulesTitle}
                </h5>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground font-medium">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>{text.widgets.rule1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>{text.widgets.rule2}</span>
                </div>
                <div className="flex items-start gap-2">
                  <FolderArchive className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span>{text.widgets.rule3}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
