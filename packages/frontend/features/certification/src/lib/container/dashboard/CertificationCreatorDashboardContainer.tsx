import {
  Plus,
  Calendar,
  ChevronDown,
  CheckCircle2,
  BarChart2,
  Loader2,
  FolderPlus,
  Library,
  Store,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import {
  Card,
  Button,
  Badge,
} from '@spark-nest-ed/frontend-shared-components';
import { useCreatorDashboardContainerLogic } from '../../hooks/container-logic/dashboard/use-creator-dashboard-container-logic';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';
import { ErrorState } from '../../components/shared/ErrorState';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { CreatorMetricsSection } from '../../components/dashboard/CreatorMetricsSection';
import { CreatorPerformanceChart } from '../../components/dashboard/CreatorPerformanceChart';
import { CreatorTopExamsSection } from '../../components/dashboard/CreatorTopExamsSection';
import { CreatorRevenueSection } from '../../components/dashboard/CreatorRevenueSection';
const dd = CERTIFICATION_UI_TEXT.dropdownItems;

export const CertificationCreatorDashboardContainer = () => {
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
    handleCreateCollection,
    isCreatingCollection,
    handleViewCollections,
    handleBrowseMarketplace,
    handleViewAnalytics,
    handleWithdraw,
    currentChartSeries,
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
                      handleCreateCollection();
                    }}
                    disabled={isCreatingCollection}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span>{chartTimeframe}</span>
          </div>

          {/* CREATOR PROFILE PILL */}
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {dashboardData.creatorName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-foreground leading-tight">{dashboardData.creatorName}</div>
              <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[9px] font-extrabold px-1.5 py-0 border-none">
                {dashboardData.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS ROW (5 METRICS) */}
      <CreatorMetricsSection
        metrics={metrics}
        text={text.metrics}
      />

      {/* 3. MIDDLE SECTION: PERFORMANCE OVERVIEW CHART & RECENT ACTIVITY */}
      <CreatorPerformanceChart
        performanceChart={performanceChart}
        activeChartTab={activeChartTab}
        setActiveChartTab={setActiveChartTab as (tab: string) => void}
        chartTimeframe={chartTimeframe}
        setChartTimeframe={setChartTimeframe as (tf: string) => void}
        currentChartSeries={currentChartSeries}
        recentActivity={recentActivity}
        text={{ ...text.performanceOverview, viewAll: text.performanceOverview.viewAll ?? 'View All' }}
      />

      {/* 4. BOTTOM SECTION: TOP PERFORMING EXAMS & REVENUE OVERVIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <CreatorTopExamsSection
          topExams={topExams}
          handleViewAnalytics={handleViewAnalytics}
          text={text.topExams}
        />

        <CreatorRevenueSection
          revenue={revenue}
          revenueTimeframe={revenueTimeframe}
          setRevenueTimeframe={setRevenueTimeframe as (tf: string) => void}
          handleWithdraw={handleWithdraw}
          handleViewAnalytics={handleViewAnalytics}
          text={text.revenueOverview}
        />
      </div>

      {/* 5. BOTTOM ROW: QUICK ACTIONS & CREATOR TIPS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* QUICK ACTIONS BAR (2 COLUMNS) */}
        <Card className="xl:col-span-2 border-border shadow-sm bg-card p-5 space-y-4">
          <h3 className="font-extrabold text-base text-foreground pb-2 border-b border-border">
            {text.quickActions.title}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={handleCreateCollection}
              disabled={isCreatingCollection}
              className="p-3 bg-secondary/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-border hover:border-indigo-300 rounded-xl text-center space-y-2 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                {isCreatingCollection ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                {text.quickActions.createCollection}
              </span>
            </button>

            <button
              onClick={handleViewCollections}
              className="p-3 bg-secondary/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-border hover:border-emerald-300 rounded-xl text-center space-y-2 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <Library className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                {text.quickActions.viewCollections}
              </span>
            </button>

            <button
              onClick={handleBrowseMarketplace}
              className="p-3 bg-secondary/30 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-border hover:border-purple-300 rounded-xl text-center space-y-2 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground block leading-tight">
                {text.quickActions.browseMarketplace}
              </span>
            </button>

            <button
              onClick={handleViewAnalytics}
              className="p-3 bg-secondary/30 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-border hover:border-amber-300 rounded-xl text-center space-y-2 transition-all cursor-pointer group"
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
