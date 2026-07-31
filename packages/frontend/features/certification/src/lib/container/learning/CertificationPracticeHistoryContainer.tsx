import {
  Clock,
  Filter,
  ChevronDown,
  List,
  Grid,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Brain,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
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
import { usePracticeHistoryContainerLogic } from '../../hooks/container-logic/learning/use-practice-history-container-logic';
import { PracticeHistoryCard } from '../../components/learning/PracticeHistoryCard';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

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
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.totalSessions}
            </span>
            <div className="text-xl font-black text-foreground">{sessions.length}</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              {sessions.length > 0 ? '+ Active' : '0 sessions'}
            </span>
          </div>
        </Card>

        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.avgBandScore}
            </span>
            <div className="text-xl font-black text-foreground">7.5 / 9.0</div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center">
              Target gain
            </span>
          </div>
        </Card>

        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.overallAccuracy}
            </span>
            <div className="text-xl font-black text-foreground">
              {sessions.length > 0 ? '82.4%' : '0%'}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{sessions.length} sessions</span>
          </div>
        </Card>

        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.practiceTime}
            </span>
            <div className="text-xl font-black text-foreground">{sessions.length * 15}m</div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
              Logged practice
            </span>
          </div>
        </Card>

        <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.bestSkill}
            </span>
            <div className="text-xl font-black text-foreground">Reading</div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
              Band 8.5
            </span>
          </div>
        </Card>
      </div>

      {/* 3. MAIN CONTENT (2 COLUMNS) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: SEARCH, TABS & SESSIONS TABLE */}
        <div className="xl:col-span-2 space-y-6">
          {/* SEARCH BAR & QUICK FILTERS */}
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

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={selectedExamFilter}
                onChange={(e) => setSelectedExamFilter(e.target.value)}
                className="bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl cursor-pointer h-9"
              >
                <option value="All">All Exams (IELTS, TOEIC...)</option>
                <option value="IELTS">IELTS</option>
                <option value="TOEIC">TOEIC</option>
                <option value="VSTEP">VSTEP</option>
              </select>

              <select
                value={selectedSkillFilter}
                onChange={(e) => setSelectedSkillFilter(e.target.value)}
                className="bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl cursor-pointer h-9"
              >
                <option value="All">All Skills</option>
                <option value="Listening">Listening</option>
                <option value="Reading">Reading</option>
                <option value="Speaking">Speaking</option>
                <option value="Writing">Writing</option>
              </select>
            </div>
          </div>

          {/* CATEGORY TABS & VIEW TOGGLE */}
          <div className="flex items-center justify-between border-b border-border pb-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              {[
                { id: 'All', label: `All (${sessions.length})` },
                { id: 'Mock Tests', label: 'Mock Tests' },
                { id: 'Practice by Part', label: 'Practice by Part' },
                { id: 'Quizzes', label: 'Quizzes' },
                { id: 'AI Practices', label: 'AI Practices' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryTab(tab.id as typeof activeCategoryTab)}
                  className={`px-3 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer whitespace-nowrap ${
                    activeCategoryTab === tab.id
                      ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-600 rounded-b-none'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* VIEW TOGGLE */}
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl">
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
            </div>
          </div>

          {/* SESSIONS TABLE OR EMPTY STATE */}
          {sessions.length === 0 ? (
            <Card className="border-border p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
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
                {text.emptyState.startBtn}
              </Button>
            </Card>
          ) : (
            <Card className="border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3 px-4">{text.tableHeaders.session}</th>
                      <th className="py-3 px-4">{text.tableHeaders.type}</th>
                      <th className="py-3 px-4">{text.tableHeaders.examPart}</th>
                      <th className="py-3 px-4">{text.tableHeaders.score}</th>
                      <th className="py-3 px-4">{text.tableHeaders.time}</th>
                      <th className="py-3 px-4">{text.tableHeaders.date}</th>
                      <th className="py-3 px-4 text-right">{text.tableHeaders.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs font-medium text-foreground">
                    {sessions.map((item) => (
                      <PracticeHistoryCard
                        key={item.id}
                        item={item}
                        onViewScorecard={handleViewScorecard}
                        onRetakeTest={handleRetakeTest}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* PAGINATION FOOTER */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-border rounded-xl bg-card gap-3 text-xs text-muted-foreground shadow-sm">
            <span>Showing 1 to 8 of 128 practice sessions</span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-border hover:bg-secondary'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(5, prev + 1))}
                className="p-1.5 rounded-lg border border-border hover:bg-secondary cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span>Show</span>
              <select className="bg-background border border-border text-xs font-bold py-1 px-2 rounded-lg">
                <option value="8">8</option>
                <option value="16">16</option>
                <option value="32">32</option>
              </select>
              <span>per page</span>
            </div>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: SIDEBAR WIDGETS */}
        <div className="space-y-6">
          {/* WIDGET 1: PERFORMANCE BREAKDOWN BY SKILL */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>{text.widgets.skillMasteryTitle}</span>
                <Brain className="w-4 h-4 text-indigo-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Listening', score: 'Band 7.5', pct: 82, color: 'bg-purple-600' },
                { name: 'Reading', score: 'Band 8.5', pct: 92, color: 'bg-blue-600' },
                { name: 'Writing', score: 'Band 6.5', pct: 68, color: 'bg-amber-500' },
                { name: 'Speaking', score: 'Band 7.0', pct: 76, color: 'bg-emerald-600' },
              ].map((s) => (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{s.name}</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {s.score}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} rounded-full`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* WIDGET 2: RECENT SCORECARDS LIST */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">{text.widgets.recentScorecardsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { title: 'IELTS Academic Mock 4', score: '7.5', date: '2 hours ago', color: 'text-purple-600' },
                { title: 'TOEIC Listening Part 3', score: '450/495', date: 'Yesterday', color: 'text-blue-600' },
                { title: 'Reading Academic Passages', score: '38/40', date: '2 days ago', color: 'text-emerald-600' },
              ].map((sc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-xs text-foreground">{sc.title}</h5>
                    <span className="text-[10px] text-muted-foreground block">{sc.date}</span>
                  </div>
                  <Badge className="bg-background border border-border text-foreground font-black text-xs">
                    {sc.score}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* WIDGET 3: AI DIAGNOSTIC RECOMMENDATION */}
          <Card className="border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-900/40 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h5 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                  {text.widgets.aiInsightTitle}
                </h5>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {text.widgets.aiInsightDesc}
              </p>
              <Button className="w-full text-xs font-bold py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer">
                {text.widgets.startBtn}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
