import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { useCreatorDashboardData, useCreateCollection } from '../../use-certification';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { CreatorDashboardResponse } from '../../../types';
import type {
  CreatorActivityItem,
  CreatorTopExamItem,
  DailyRevenueItem,
} from '../../../types/container-logic-dashboard.types';
import { ICON_BG_CLASSES, getCategoryBadge } from '../../../services/creator-dashboard-helpers.service';

export type { CreatorActivityItem, CreatorTopExamItem, DailyRevenueItem } from '../../../types/container-logic-dashboard.types';

// ===== Hook =====

export function useCreatorDashboardContainerLogic() {
  const navigate = useNavigate();
  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useCreatorDashboardData();
  const createCollectionMutation = useCreateCollection();
  const { toast } = useToast();

  // Chart tab state
  const [activeChartTab, setActiveChartTab] = useState<'Attempts' | 'Average Score' | 'Revenue'>('Attempts');
  const [chartTimeframe, setChartTimeframe] = useState<'Last 7 Days' | 'Last 30 Days' | 'This Month'>('Last 7 Days');
  const [revenueTimeframe, setRevenueTimeframe] = useState<'This Month' | 'Last Month' | 'This Year'>('This Month');
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

  // ===== API data → view model =====

  const dashboardData = useMemo(() => {
    if (!apiData) {
      return {
        creatorName: 'Creator',
        role: 'Creator',
        metrics: {
          totalExams: 0, totalExamsWeeklyChange: '',
          totalQuestions: 0, totalQuestionsWeeklyChange: '',
          totalAttempts: 0, totalAttemptsWeeklyChange: '',
          averageScore: '0%', averageScoreWeeklyChange: '',
          likesReceived: 0, likesReceivedWeeklyChange: '',
        },
        performanceChart: { timeframe: 'Last 7 Days', dates: [] as string[], attempts: [] as number[], averageScores: [] as number[], revenue: [] as number[] },
        recentActivity: [] as CreatorActivityItem[],
        topExams: [] as CreatorTopExamItem[],
        revenue: { totalRevenue: '$0.00', revenueGrowth: '', payoutBalance: '$0.00', dailyData: [] as DailyRevenueItem[] },
      };
    }

    const api = apiData as unknown as CreatorDashboardResponse;

    return {
      creatorName: 'Creator',
      role: 'Creator',
      metrics: {
        totalExams: api.metrics?.totalExams ?? 0,
        totalExamsWeeklyChange: api.metrics?.totalExamsWeeklyChange ?? '',
        totalQuestions: api.metrics?.totalQuestions ?? 0,
        totalQuestionsWeeklyChange: api.metrics?.totalQuestionsWeeklyChange ?? '',
        totalAttempts: api.metrics?.totalAttempts ?? 0,
        totalAttemptsWeeklyChange: api.metrics?.totalAttemptsWeeklyChange ?? '',
        averageScore: typeof api.metrics?.averageScore === 'number'
          ? `${api.metrics.averageScore}%`
          : String(api.metrics?.averageScore ?? '0%'),
        averageScoreWeeklyChange: api.metrics?.averageScoreWeeklyChange ?? '',
        likesReceived: api.metrics?.likesReceived ?? 0,
        likesReceivedWeeklyChange: api.metrics?.likesReceivedWeeklyChange ?? '',
      },
      performanceChart: {
        timeframe: api.performanceChart?.timeframe ?? 'Last 7 Days',
        dates: api.performanceChart?.dates ?? [],
        attempts: api.performanceChart?.attempts ?? [],
        averageScores: api.performanceChart?.averageScores ?? [],
        revenue: api.performanceChart?.revenue ?? [],
      },
      topExams: (api.topExams ?? []).map((exam, idx) => {
        const cat = getCategoryBadge(exam.title);
        return {
          rank: idx + 1,
          id: exam.id || `exam-${idx}`,
          title: exam.title || `Exam ${idx + 1}`,
          category: cat.category,
          categoryBadge: cat.badge,
          categoryBadgeClass: cat.badgeClass,
          attempts: exam.attempts ?? 0,
          avgScore: typeof exam.avgScore === 'number' ? `${exam.avgScore}%` : exam.avgScore ?? '0%',
          likes: exam.likes ?? 0,
        };
      }),
      recentActivity: (api.recentActivity ?? []).map((act, idx) => ({
        id: act.id || `act-${idx}`,
        type: act.type || 'session',
        title: act.title || '',
        timestamp: act.timestamp || '',
        iconType: 'check' as const,
        iconBgClass: ICON_BG_CLASSES[idx % ICON_BG_CLASSES.length],
      })),
      revenue: {
        totalRevenue: api.revenue?.totalRevenue ?? '$0.00',
        revenueGrowth: api.revenue?.revenueGrowth ?? '',
        payoutBalance: api.revenue?.payoutBalance ?? '$0.00',
        dailyData: (api.revenue?.dailyData ?? []).map((d) => ({ day: d.day ?? '', amount: d.amount ?? 0 })),
      },
    };
  }, [apiData]);

  // ===== Derived chart data =====

  const currentChartSeries = useMemo(() => {
    const chart = dashboardData.performanceChart;
    if (activeChartTab === 'Attempts') return { label: 'Attempts', data: chart.attempts };
    if (activeChartTab === 'Average Score') return { label: 'Average Score (%)', data: chart.averageScores };
    return { label: 'Revenue ($)', data: chart.revenue };
  }, [dashboardData, activeChartTab]);

  // ===== Navigation handlers =====

  const handleCreateCollection = () => {
    createCollectionMutation.mutate(
      { title: 'Untitled Collection', description: null, silent: true },
      { onSuccess: (data) => navigate(`/certification/collection-editor/${data.id}`) },
    );
  };

  const handleViewCollections = () => navigate('/certification/library');
  const handleBrowseMarketplace = () => navigate('/certification/community-collections');
  const handleViewAnalytics = () => navigate('/certification/analytics');
  const handleBackToLearning = () => navigate('/certification/library');

  const handleWithdraw = () => {
    toast({
      ...CERTIFICATION_UI_TEXT.toast.withdrawSuccess,
      description: `Yêu cầu rút tiền đã được gửi cho số dư ${dashboardData.revenue.payoutBalance}.`,
    });
  };

  return {
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
    currentChartSeries,
    handleCreateCollection,
    handleViewCollections,
    handleBrowseMarketplace,
    handleViewAnalytics,
    handleWithdraw,
    handleBackToLearning,
    isCreatingCollection: createCollectionMutation.isPending,
  };
}
