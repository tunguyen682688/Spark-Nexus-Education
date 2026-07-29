import {
  Bookmark,
  BookOpen,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  ArrowLeft,
  Play,
  Trash2,
  Sparkles,
  Trophy,
  History,
  FolderHeart,
  ArrowUpDown,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Input,
} from '@spark-nest-ed/frontend-shared-components';
import { useLibraryContainerLogic } from '../hooks/useLibraryContainerLogic';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

const LIBRARY_EXAM_FILTERS = [
  { id: 'All', label: 'All Exams' },
  { id: 'IELTS', label: 'IELTS' },
  { id: 'TOEIC', label: 'TOEIC' },
  { id: 'TOEFL', label: 'TOEFL' },
  { id: 'VSTEP', label: 'VSTEP' },
  { id: 'Cambridge', label: 'Cambridge' },
];

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-amber-300 fill-current" />
            {libText.title}
          </h1>
          <p className="text-sm text-indigo-100 font-medium max-w-2xl">
            {libText.subtitle}
          </p>

          {/* QUICK METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">
                {libText.metrics.savedCollections}
              </span>
              <span className="text-xl font-black text-white">
                {totalSavedCount}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">
                {libText.metrics.mocksCompleted}
              </span>
              <span className="text-xl font-black text-emerald-300">
                {dashboardStats?.completedMocks || '0'}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">
                {libText.metrics.accuracyScore}
              </span>
              <span className="text-xl font-black text-amber-300">
                {dashboardStats?.accuracy || '0%'}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-indigo-200 uppercase font-extrabold tracking-wider block">
                {libText.metrics.targetScore}
              </span>
              <span className="text-xl font-black text-sky-300">
                {dashboardStats?.targetScore || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        {/* SEARCH INPUT */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={libText.searchPlaceholder}
            className="pl-9 text-xs bg-background"
          />
        </div>

        {/* EXAM FILTER PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground mr-1 flex-shrink-0" />
          {LIBRARY_EXAM_FILTERS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedExamFilter(opt.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedExamFilter === opt.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-secondary/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}

          <div className="ml-2 border-l border-border pl-2 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'title')}
              className="text-xs font-bold text-foreground bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="recent">Gần đây</option>
              <option value="title">Tên A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN LIBRARY TAB BAR */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'saved'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>
            {libText.tabs.saved} ({totalSavedCount})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'in_progress'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{libText.tabs.inProgress}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{libText.tabs.history}</span>
        </button>

        <button
          onClick={() => setActiveTab('my_clones')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'my_clones'
              ? 'border-indigo-600 text-indigo-600 font-extrabold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{libText.tabs.myClones}</span>
        </button>
      </div>

      {/* 5. TAB CONTENT PANELS */}
      {/* TAB 1: SAVED COLLECTIONS */}
      {activeTab === 'saved' && (
        <div>
          {isLoadingSaved ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : isErrorSaved ? (
            <ErrorState
              onRetry={refetchSaved}
              message={CERTIFICATION_UI_TEXT.error.collections}
            />
          ) : savedCollections.length === 0 ? (
            <Card className="border-dashed p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <Bookmark className="w-12 h-12 text-muted-foreground/40" />
                <h3 className="text-base font-extrabold">
                  {libText.emptySaved.title}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  {libText.emptySaved.description}
                </p>
                <Button
                  onClick={handleBackToDashboard}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs mt-2 cursor-pointer"
                >
                  {libText.emptySaved.exploreBtn}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCollections.map((collection) => (
                <Card
                  key={collection.id}
                  onClick={() => handleOpenCollection(collection.id)}
                  className="border-border hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-bold"
                      >
                        {collection.exam}
                      </Badge>
                      <button
                        onClick={(e) => handleUnbookmark(collection.id, e)}
                        title={libText.card.unbookmarkTooltip}
                        className="p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <CardTitle className="text-sm font-extrabold text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {collection.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                      {collection.description ||
                        collection.subtitle ||
                        libText.card.defaultDesc}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-3">
                      <span className="flex items-center gap-1 font-semibold">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        {collection.examCount ||
                          collection.itemsCount ||
                          5}{' '}
                        {libText.card.mockTestsCount}
                      </span>
                      {collection.level && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold"
                        >
                          {collection.level}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => handleStartExam(collection.id, e)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />{' '}
                        {libText.card.practiceBtn}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IN PROGRESS SESSIONS */}
      {activeTab === 'in_progress' && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />{' '}
              {libText.inProgressTab.title}
            </CardTitle>
            <CardDescription>
              {libText.inProgressTab.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingInProgress ? (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : isErrorInProgress ? (
              <ErrorState onRetry={refetchInProgress} message={CERTIFICATION_UI_TEXT.error.practiceHistory} />
            ) : inProgressSessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground/40" />
                <p>Không có phiên thi đang thực hiện</p>
                <p className="text-[11px]">Bắt đầu một bài thi để phiên hiện xuất hiện ở đây</p>
              </div>
            ) : (
              inProgressSessions.map((session) => (
                <div key={session.id} className="p-4 border border-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-secondary/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500 text-white text-[10px]">
                        {libText.inProgressTab.badge}
                      </Badge>
                      <h4 className="font-bold text-sm text-foreground">
                        {session.title || session.examTitle}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.timeAgo} &bull; {session.totalQuestions} câu hỏi
                    </p>
                  </div>
                  <Button
                    onClick={(e) => handleStartExam(session.examId, e)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />{' '}
                    {libText.inProgressTab.resumeBtn}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: EXAM HISTORY */}
      {activeTab === 'history' && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />{' '}
              {libText.historyTab.title}
            </CardTitle>
            <CardDescription>{libText.historyTab.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingHistory ? (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : isErrorHistory ? (
              <ErrorState onRetry={refetchHistory} message={CERTIFICATION_UI_TEXT.error.practiceHistory} />
            ) : practiceHistoryItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-muted-foreground/40" />
                <p>Chưa có lịch sử thi</p>
                <p className="text-[11px]">Hoàn thành một bài thi để xem kết quả ở đây</p>
              </div>
            ) : (
              practiceHistoryItems.map((item) => (
                <div key={item.id} className="p-4 border border-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={item.scoreSub === 'Đạt' ? 'bg-emerald-500 text-white text-[10px]' : 'bg-red-500 text-white text-[10px]'}>
                        {item.scoreSub === 'Đạt' ? libText.historyTab.completedBadge : 'Chưa đạt'}
                      </Badge>
                      <h4 className="font-bold text-sm text-foreground">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>
                        Điểm:{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {item.scoreDisplay}
                        </strong>
                      </span>
                      <span>&bull; {item.dateDisplay}</span>
                      <span>&bull; {item.timeSpent}</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStartExam(item.id)}
                    variant="outline"
                    className="font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{' '}
                    {libText.historyTab.viewScorecardBtn}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: MY CLONES */}
      {activeTab === 'my_clones' && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />{' '}
              {libText.myClonesTab.title}
            </CardTitle>
            <CardDescription>{libText.myClonesTab.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCloned ? (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : isErrorCloned ? (
              <ErrorState onRetry={refetchCloned} message={CERTIFICATION_UI_TEXT.error.collections} />
            ) : clonedCollections.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/40" />
                <p>{libText.myClonesTab.emptyTitle}</p>
                <p className="text-[11px]">{libText.myClonesTab.emptyDesc}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clonedCollections.map((col) => (
                  <Card
                    key={col.id}
                    onClick={() => handleOpenCollection(col.id)}
                    className="border-border hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          Bản nháp
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-extrabold text-foreground group-hover:text-amber-600 transition-colors line-clamp-2">
                        {col.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                        {col.description || 'Chưa có mô tả'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-3">
                        <span className="flex items-center gap-1 font-semibold">
                          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                          {col.examCount} đề thi
                        </span>
                        <span>{col.itemCount} mục</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
