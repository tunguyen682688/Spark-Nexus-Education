import React from 'react';
import {
  FileText,
  HelpCircle,
  Users,
  TrendingUp,
  Heart,
  Plus,
  Calendar,
  Bell,
  ChevronDown,
  Info,
  CheckCircle2,
  FileCode,
  Star,
  MessageSquare,
  BarChart2,
  MoreVertical,
  Wallet,
  Sparkles,
  Upload,
  FolderPlus,
  Lightbulb,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { useCreatorDashboardContainerLogic } from '../hooks/useCreatorDashboardContainerLogic';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';
const dd = CERTIFICATION_UI_TEXT.dropdownItems;
const tf = CERTIFICATION_UI_TEXT.timeframeOptions;

export const CertificationCreatorDashboardContainer: React.FC = () => {
  const {
    isApiLoading,
    isError,
    refetch,
    dashboardData,
    activeChartTab,
    setActiveChartTab,
    chartTimeframe,
    setChartTimeframe,
    revenueTimeframe,
    setRevenueTimeframe,
    isCreateDropdownOpen,
    setIsCreateDropdownOpen,
    handleCreateNewExam,
    handleAIGenerateQuestions,
    handleImportQuestions,
    handleCreateCollection,
    handleViewAnalytics,
    handleWithdraw,
  } = useCreatorDashboardContainerLogic();

  const text = CERTIFICATION_UI_TEXT.creatorDashboard;

  if (isApiLoading) {
    return <LoadingSkeleton count={6} />;
  }

  if (isError) {
    return <ErrorState message={CERTIFICATION_UI_TEXT.error.dashboard} onRetry={refetch} />;
  }

  const { metrics, performanceChart, recentActivity, topExams, revenue } = dashboardData;

  return (
    <div className="w-full space-y-6 pb-16">
      {/* 1. HEADER ROW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {text.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
            {text.subtitle}
          </p>
        </div>

        {/* TOP CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* CREATE NEW DROPDOWN BUTTON */}
          <div className="relative">
            <Button
              onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{text.createNewBtn}</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </Button>

            {isCreateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 py-1 divide-y divide-border">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsCreateDropdownOpen(false);
                      handleCreateNewExam();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    {dd.newExam}
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateDropdownOpen(false);
                      handleAIGenerateQuestions();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    {dd.aiQuestionGenerator}
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateDropdownOpen(false);
                      handleImportQuestions();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    {dd.importQuestions}
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateDropdownOpen(false);
                      handleCreateCollection();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary flex items-center gap-2"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
                    {dd.newCollection}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DATE RANGE PICKER PILL */}
          <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-xs font-bold text-foreground shadow-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>May 10 - May 16, 2024</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
          </div>

          {/* NOTIFICATION BELL */}
          <button className="relative p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
              3
            </span>
          </button>

          {/* CREATOR PROFILE PILL */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              MA
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-foreground leading-tight">Minh Anh</div>
              <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[9px] font-extrabold px-1.5 py-0 border-none">
                Creator
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS ROW (5 METRICS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* METRIC 1: TOTAL EXAMS */}
        <Card className="border-border shadow-sm p-4 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.totalExams}
            </span>
            <div className="text-2xl font-black text-foreground mt-0.5">
              {metrics.totalExams}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {metrics.totalExamsWeeklyChange}
            </span>
          </div>
        </Card>

        {/* METRIC 2: TOTAL QUESTIONS */}
        <Card className="border-border shadow-sm p-4 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.totalQuestions}
            </span>
            <div className="text-2xl font-black text-foreground mt-0.5">
              {metrics.totalQuestions.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {metrics.totalQuestionsWeeklyChange}
            </span>
          </div>
        </Card>

        {/* METRIC 3: TOTAL ATTEMPTS */}
        <Card className="border-border shadow-sm p-4 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.totalAttempts}
            </span>
            <div className="text-2xl font-black text-foreground mt-0.5">
              {metrics.totalAttempts.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {metrics.totalAttemptsWeeklyChange}
            </span>
          </div>
        </Card>

        {/* METRIC 4: AVERAGE SCORE */}
        <Card className="border-border shadow-sm p-4 bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.avgScore}
            </span>
            <div className="text-2xl font-black text-foreground mt-0.5">
              {metrics.averageScore}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {metrics.averageScoreWeeklyChange}
            </span>
          </div>
        </Card>

        {/* METRIC 5: LIKES RECEIVED */}
        <Card className="border-border shadow-sm p-4 bg-card col-span-2 md:col-span-1 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-muted-foreground font-bold block uppercase tracking-wider">
              {text.metrics.likesReceived}
            </span>
            <div className="text-2xl font-black text-foreground mt-0.5">
              {metrics.likesReceived}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">
              {metrics.likesReceivedWeeklyChange}
            </span>
          </div>
        </Card>
      </div>

      {/* 3. MIDDLE SECTION: PERFORMANCE OVERVIEW CHART & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: PERFORMANCE OVERVIEW CHART */}
        <Card className="xl:col-span-2 border-border shadow-sm bg-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-foreground">
                {text.performanceOverview.title}
              </h3>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* CHART TIMEFRAME SELECTOR */}
            <div className="relative">
              <select
                value={chartTimeframe}
                onChange={(e) => setChartTimeframe(e.target.value as typeof chartTimeframe)}
                className="appearance-none bg-background border border-border text-xs font-bold text-foreground py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={tf.last7Days}>{tf.last7Days}</option>
                <option value={tf.last30Days}>{tf.last30Days}</option>
                <option value={tf.thisMonth}>{tf.thisMonth}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* METRIC TABS FOR CHART */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {([CERTIFICATION_UI_TEXT.chartTabs.attempts, CERTIFICATION_UI_TEXT.chartTabs.averageScore, CERTIFICATION_UI_TEXT.chartTabs.likes, CERTIFICATION_UI_TEXT.chartTabs.revenue] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveChartTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer ${
                  activeChartTab === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SVG LINE CHART WITH GRADIENT AREA & CALLOUT POINTS */}
          <div className="w-full pt-4 pb-2">
            <div className="relative h-64 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* HORIZONTAL GRID LINES */}
                {[0, 60, 120, 180].map((y) => (
                  <line
                    key={y}
                    x1="40"
                    y1={y}
                    x2="680"
                    y2={y}
                    stroke="currentColor"
                    className="text-border/60"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Y-AXIS LABELS */}
                <text x="10" y="10" className="text-[10px] fill-muted-foreground font-semibold">2.5K</text>
                <text x="10" y="70" className="text-[10px] fill-muted-foreground font-semibold">2K</text>
                <text x="10" y="130" className="text-[10px] fill-muted-foreground font-semibold">1.5K</text>
                <text x="10" y="190" className="text-[10px] fill-muted-foreground font-semibold">500</text>
                <text x="20" y="235" className="text-[10px] fill-muted-foreground font-semibold">0</text>

                {/* AREA FILL */}
                <polygon
                  points="50,170 150,135 250,100 350,75 450,110 550,60 650,55 650,220 50,220"
                  fill="url(#chartGradient)"
                />

                {/* SMOOTH CURVED LINE */}
                <path
                  d="M 50 170 Q 100 150, 150 135 T 250 100 T 350 75 T 450 110 T 550 60 T 650 55"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* DATA POINTS & VALUE CALLOUTS */}
                {[
                  { x: 50, y: 170, val: '1,234' },
                  { x: 150, y: 135, val: '1,564' },
                  { x: 250, y: 100, val: '1,876' },
                  { x: 350, y: 75, val: '2,034' },
                  { x: 450, y: 110, val: '1,812' },
                  { x: 550, y: 60, val: '2,146' },
                  { x: 650, y: 55, val: '2,190' },
                ].map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      className="text-[10px] font-black fill-indigo-600 dark:fill-indigo-400"
                    >
                      {pt.val}
                    </text>
                  </g>
                ))}

                {/* X-AXIS DATES */}
                {performanceChart.dates.map((date, idx) => (
                  <text
                    key={date}
                    x={50 + idx * 100}
                    y="235"
                    textAnchor="middle"
                    className="text-[10px] fill-muted-foreground font-semibold"
                  >
                    {date}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </Card>

        {/* RIGHT 1 COLUMN: RECENT ACTIVITY WIDGET */}
        <Card className="border-border shadow-sm bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-extrabold text-base text-foreground">
              {text.recentActivity.title}
            </h3>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
              {text.recentActivity.viewAll}
            </button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBgClass}`}
                >
                  {item.iconType === 'check' && <CheckCircle2 className="w-4 h-4" />}
                  {item.iconType === 'document' && <FileCode className="w-4 h-4" />}
                  {item.iconType === 'star' && <Star className="w-4 h-4" />}
                  {item.iconType === 'comment' && <MessageSquare className="w-4 h-4" />}
                  {item.iconType === 'heart' && <Heart className="w-4 h-4 fill-current" />}
                </div>

                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-foreground leading-snug">{item.title}</p>
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. BOTTOM SECTION: TOP PERFORMING EXAMS & REVENUE OVERVIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: TOP PERFORMING EXAMS TABLE */}
        <Card className="xl:col-span-2 border-border shadow-sm bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-extrabold text-base text-foreground">
              {text.topExams.title}
            </h3>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
              {text.topExams.viewAllExams}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">{text.topExams.tableHeaders.examTitle}</th>
                  <th className="py-2.5 px-3">{text.topExams.tableHeaders.attempts}</th>
                  <th className="py-2.5 px-3">{text.topExams.tableHeaders.avgScore}</th>
                  <th className="py-2.5 px-3">{text.topExams.tableHeaders.likes}</th>
                  <th className="py-2.5 px-3 text-right">{text.topExams.tableHeaders.action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium">
                {topExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-muted-foreground">{exam.rank}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <Badge
                          className={`font-black text-[10px] px-2 py-0.5 rounded-lg border-none ${exam.categoryBadgeClass}`}
                        >
                          {exam.categoryBadge}
                        </Badge>
                        <div>
                          <div className="font-extrabold text-foreground">{exam.title}</div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {exam.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-foreground">
                      {exam.attempts.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{exam.avgScore}</span>
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${parseFloat(exam.avgScore)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-bold text-foreground">
                        <span>{exam.likes}</span>
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={handleViewAnalytics}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-xs text-muted-foreground font-medium">
            Showing top 5 of 23 exams
          </div>
        </Card>

        {/* RIGHT 1 COLUMN: REVENUE OVERVIEW */}
        <Card className="border-border shadow-sm bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-extrabold text-base text-foreground">
              {text.revenueOverview.title}
            </h3>

            <div className="relative">
              <select
                value={revenueTimeframe}
                onChange={(e) => setRevenueTimeframe(e.target.value as typeof revenueTimeframe)}
                className="appearance-none bg-background border border-border text-xs font-bold text-foreground py-1 pl-2.5 pr-7 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={tf.thisMonth}>{tf.thisMonth}</option>
                <option value={tf.lastMonth}>{tf.lastMonth}</option>
                <option value={tf.thisYear}>{tf.thisYear}</option>
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* REVENUE CARDS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>{text.revenueOverview.totalRevenue}</span>
              </div>
              <div className="text-xl font-black text-foreground">
                {revenue.totalRevenue}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">
                {revenue.revenueGrowth}
              </span>
            </div>

            <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
              <div className="text-xs text-muted-foreground font-semibold">
                {text.revenueOverview.payoutBalance}
              </div>
              <div className="text-xl font-black text-foreground">
                {revenue.payoutBalance}
              </div>
              <Button
                onClick={handleWithdraw}
                className="w-full mt-1 bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px] py-1 h-7 rounded-lg border-none cursor-pointer"
              >
                {text.revenueOverview.withdrawBtn}
              </Button>
            </div>
          </div>

          {/* BAR CHART FOR DAILY REVENUE */}
          <div className="space-y-2 pt-2">
            <div className="h-32 flex items-end justify-between gap-1 pt-4 border-b border-border">
              {revenue.dailyData.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className="w-full bg-indigo-400 dark:bg-indigo-600 rounded-t transition-all hover:bg-indigo-600"
                    style={{ height: `${(d.amount / 120) * 100}%` }}
                    title={`${d.day}: $${d.amount}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold pt-1">
              <span>May 1</span>
              <span>May 5</span>
              <span>May 9</span>
              <span>May 13</span>
              <span>May 16</span>
            </div>
          </div>

          <button
            onClick={handleViewAnalytics}
            className="w-full flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer pt-1"
          >
            <span>{text.revenueOverview.viewEarningsDetails}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Card>
      </div>

      {/* 5. BOTTOM ROW: QUICK ACTIONS & CREATOR TIPS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* QUICK ACTIONS BAR (2 COLUMNS) */}
        <Card className="xl:col-span-2 border-border shadow-sm bg-card p-5 space-y-4">
          <h3 className="font-extrabold text-base text-foreground pb-2 border-b border-border">
            {text.quickActions.title}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <button
              onClick={handleCreateNewExam}
              className="p-3 bg-secondary/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-border hover:border-indigo-300 rounded-xl text-center space-y-2 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                {text.quickActions.createExam}
              </span>
            </button>

            <button
              onClick={handleAIGenerateQuestions}
              className="p-3 bg-secondary/30 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-border hover:border-purple-300 rounded-xl text-center space-y-2 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                {text.quickActions.aiGenerate}
              </span>
            </button>

            <button
              onClick={handleImportQuestions}
              className="p-3 bg-secondary/30 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-border hover:border-blue-300 rounded-xl text-center space-y-2 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                {text.quickActions.importQuestions}
              </span>
            </button>

            <button
              onClick={handleCreateCollection}
              className="p-3 bg-secondary/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-border hover:border-emerald-300 rounded-xl text-center space-y-2 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <FolderPlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                {text.quickActions.createCollection}
              </span>
            </button>

            <button
              onClick={handleViewAnalytics}
              className="p-3 bg-secondary/30 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-border hover:border-amber-300 rounded-xl text-center space-y-2 transition-all cursor-pointer group col-span-2 sm:col-span-1"
            >
              <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <BarChart2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                {text.quickActions.viewAnalytics}
              </span>
            </button>
          </div>
        </Card>

        {/* CREATOR TIPS WIDGET (1 COLUMN) */}
        <Card className="border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900/40 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h5 className="font-extrabold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              {text.creatorTips.title}
            </h5>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground font-medium">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>{text.creatorTips.tip1}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>{text.creatorTips.tip2}</span>
            </div>
          </div>

          <button className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer pt-1">
            <span>{text.creatorTips.viewAllTips}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </Card>
      </div>
    </div>
  );
};
