import {
  Bookmark,
  ChevronDown,
  Grid,
  List,
  FolderPlus,
  ArrowRight,
  Sparkles,
  Search,
  BookOpen,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@spark-nest-ed/frontend-shared-components';
import { useBookmarksContainerLogic, type BookmarkFolder, type BookmarkItem } from '../../hooks/container-logic/library/use-bookmarks-container-logic';
import { BookmarkCard } from '../../components/library/BookmarkCard';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { Pagination } from '../../components/shared/Pagination';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export const CertificationBookmarksContainer = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    activeFolderId,
    setActiveFolderId,
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
    folders,
    items,
    totalCount,
    isCreateFolderOpen,
    setIsCreateFolderOpen,
    newFolderName,
    setNewFolderName,
    handleCreateFolder,
    handleOpenItem,
    handleRemoveBookmark,
    handleStartRevisionQuiz,
    handleBackToLearning,
  } = useBookmarksContainerLogic();

  const text = CERTIFICATION_UI_TEXT.bookmarks;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.bookmarks} onRetry={refetch} />;
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
              <Bookmark className="w-7 h-7 text-indigo-600 dark:text-indigo-400 fill-current" />
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {text.title}
              </h1>
            </div>
            <Badge className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm px-2.5 py-0.5 rounded-full border-none">
              {totalCount} Items
            </Badge>
          </div>

          {/* TOP CONTROLS */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateFolderOpen(true)}
              variant="outline"
              className="text-xs font-bold py-2 px-3 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              {text.newFolderBtn}
            </Button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'folder')}
                className="appearance-none bg-background border border-border hover:border-indigo-500/50 text-xs font-bold text-foreground py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer h-9"
              >
                <option value="recent">{text.sortOptions.recent}</option>
                <option value="name">{text.sortOptions.name}</option>
                <option value="folder">{text.sortOptions.folder}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {text.subtitle}
        </p>
      </div>

      {/* 2. FOLDERS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {folders.map((folder: BookmarkFolder) => (
          <button
            key={folder.id}
            onClick={() => setActiveFolderId(folder.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              activeFolderId === folder.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-card border border-border text-foreground hover:bg-secondary'
            }`}
          >
            <span>{folder.name}</span>
            <Badge
              className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                activeFolderId === folder.id
                  ? 'bg-white/20 text-white'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {folder.count || items.length}
            </Badge>
          </button>
        ))}
      </div>

      {/* 3. MAIN LAYOUT GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: SEARCH, TABS & BOOKMARK CARDS */}
        <div className="xl:col-span-2 space-y-6">
          {/* SEARCH & FILTER BAR */}
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

          {/* TYPE TABS */}
          <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {[
                { id: 'All', label: text.tabs.all },
                { id: 'Collections', label: text.tabs.collections },
                { id: 'Tests', label: text.tabs.tests },
                { id: 'Questions', label: text.tabs.questions },
                { id: 'Vocabulary', label: text.tabs.vocabulary },
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
          </div>

          {/* BOOKMARK CARDS GRID OR EMPTY STATE */}
          {items.length === 0 ? (
            <Card className="border-border p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-foreground">{text.emptyState.title}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {text.emptyState.description}
                </p>
              </div>
              <Button
                onClick={handleBackToLearning}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                {text.emptyState.browseBtn}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((item: BookmarkItem) => (
                <BookmarkCard
                  key={item.id}
                  item={item}
                  onOpenItem={handleOpenItem}
                  onRemoveBookmark={handleRemoveBookmark}
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
          {/* WIDGET 1: FOLDER STATS SUMMARY */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">{text.folderStatsWidget.title}</CardTitle>
              <button
                onClick={() => setIsCreateFolderOpen(true)}
                className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
              >
                {text.folderStatsWidget.addFolderBtn}
              </button>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {folders.slice(1).map((f: BookmarkFolder) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 text-xs font-semibold"
                >
                  <span className="text-foreground">{f.name}</span>
                  <Badge className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-extrabold border-none text-[10px]">
                    {f.count || items.length} items
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* WIDGET 2: QUICK ACTION */}
          <Card className="border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-900/40 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h5 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                  {text.smartRevisionWidget.title}
                </h5>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {text.smartRevisionWidget.descriptionPrefix} {totalCount} {text.smartRevisionWidget.descriptionSuffix}
              </p>
              <Button
                onClick={handleStartRevisionQuiz}
                className="w-full text-xs font-bold py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                {text.smartRevisionWidget.startBtn}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CREATE NEW FOLDER MODAL */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
              <FolderPlus className="w-5 h-5 text-indigo-600" />
              {text.createFolderModal.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {text.createFolderModal.description}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateFolder} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">{text.createFolderModal.labelName}</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder={text.createFolderModal.placeholderName}
                className="text-xs py-2 bg-background rounded-xl border-border"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateFolderOpen(false)}
                className="text-xs font-bold rounded-xl"
              >
                {text.createFolderModal.cancelBtn}
              </Button>
              <Button
                type="submit"
                disabled={!newFolderName.trim()}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                {text.createFolderModal.submitBtn}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
