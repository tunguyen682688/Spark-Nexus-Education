import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { useCreatorDashboardData, useCreateCollection } from '../../use-certification';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { CreatorDashboardResponse } from '../../../types';

// ===== View types =====

export interface CreatorMetricCard {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  iconType: 'exam' | 'question' | 'attempt' | 'score' | 'like';
}

export interface CreatorActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  iconType: 'check' | 'document' | 'star' | 'comment' | 'heart';
  iconBgClass: string;
}

export interface CreatorTopExamItem {
  rank: number;
  id: string;
  title: string;
  category: string;
  categoryBadge: string;
  categoryBadgeClass: string;
  attempts: number;
  avgScore: string;
  likes: number;
}

export interface DailyRevenueItem {
  day: string;
  amount: number;
}

// ===== Constants =====

const ICON_BG_CLASSES = [
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
];

/** Maps exam title keywords to display category + badge metadata. */
const CATEGORY_BADGE_MAP: Array<{ keywords: string[]; category: string; badge: string; badgeClass: string }> = [
  { keywords: ['TOEIC'], category: 'Full Test', badge: 'TOEIC', badgeClass: 'bg-blue-600 text-white' },
  { keywords: ['IELTS'], category: 'Full Test', badge: 'IELTS', badgeClass: 'bg-indigo-600 text-white' },
  { keywords: ['READING', 'READ'], category: 'Reading', badge: 'READING', badgeClass: 'bg-teal-600 text-white' },
  { keywords: ['LISTENING', 'LISTEN'], category: 'Listening', badge: 'LISTENING', badgeClass: 'bg-indigo-600 text-white' },
  { keywords: ['GRAMMAR'], category: 'Grammar', badge: 'GRAMMAR', badgeClass: 'bg-emerald-600 text-white' },
  { keywords: ['VOCAB'], category: 'Vocabulary', badge: 'VOCAB', badgeClass: 'bg-rose-600 text-white' },
];

const FALLBACK_BADGE = { category: 'General', badge: 'OTHER', badgeClass: 'bg-gray-600 text-white' };

function getCategoryBadge(title: string) {
  const upper = title.toUpperCase();
  return CATEGORY_BADGE_MAP.find((entry) => entry.keywords.some((kw) => upper.includes(kw))) ?? FALLBACK_BADGE;
}

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
