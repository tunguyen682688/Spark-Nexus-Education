import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatorDashboardData } from './use-certification';

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

export function useCreatorDashboardContainerLogic() {
  const navigate = useNavigate();
  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useCreatorDashboardData();

  const [activeChartTab, setActiveChartTab] = useState<'Attempts' | 'Average Score' | 'Likes' | 'Revenue'>('Attempts');
  const [chartTimeframe, setChartTimeframe] = useState<'Last 7 Days' | 'Last 30 Days' | 'This Month'>('Last 7 Days');
  const [revenueTimeframe, setRevenueTimeframe] = useState<'This Month' | 'Last Month' | 'This Year'>('This Month');
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

  // Default fallback data matching the uploaded image design exactly
  const defaultData = useMemo(
    () => ({
      creatorName: 'Minh Anh',
      role: 'Creator',
      metrics: {
        totalExams: 23,
        totalExamsWeeklyChange: '+3 this week',
        totalQuestions: 1248,
        totalQuestionsWeeklyChange: '+86 this week',
        totalAttempts: 12856,
        totalAttemptsWeeklyChange: '+1,234 this week',
        averageScore: '72.6%',
        averageScoreWeeklyChange: '+4.8% vs last week',
        likesReceived: 532,
        likesReceivedWeeklyChange: '+48 this week',
      },
      performanceChart: {
        timeframe: 'Last 7 Days',
        dates: ['May 10', 'May 11', 'May 12', 'May 13', 'May 14', 'May 15', 'May 16'],
        attempts: [1234, 1564, 1876, 2034, 1812, 2146, 2190],
        averageScores: [70.2, 71.5, 72.0, 72.8, 71.9, 73.1, 72.6],
        likes: [45, 62, 78, 85, 70, 92, 100],
        revenue: [40, 65, 80, 110, 75, 125, 130],
      },
      recentActivity: [
        {
          id: 'act-1',
          type: 'publish',
          title: 'You published "TOEIC Full Test 10 (2024)"',
          timestamp: 'May 16, 2024 10:15 AM',
          iconType: 'check' as const,
          iconBgClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
        },
        {
          id: 'act-2',
          type: 'update',
          title: 'You updated 15 questions in "Part 7: Reading"',
          timestamp: 'May 15, 2024 03:42 PM',
          iconType: 'document' as const,
          iconBgClass: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
        },
        {
          id: 'act-3',
          type: 'like',
          title: 'Your exam "Daily Grammar Quiz #12" got 48 likes',
          timestamp: 'May 15, 2024 11:20 AM',
          iconType: 'star' as const,
          iconBgClass: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
        },
        {
          id: 'act-4',
          type: 'comment',
          title: 'New comment on "Business Vocabulary Set 3"',
          timestamp: 'May 14, 2024 09:18 PM',
          iconType: 'comment' as const,
          iconBgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
        },
        {
          id: 'act-5',
          type: 'like',
          title: 'Your exam "Listening Practice Set 5" got 32 likes',
          timestamp: 'May 14, 2024 04:05 PM',
          iconType: 'heart' as const,
          iconBgClass: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
        },
      ],
      topExams: [
        {
          rank: 1,
          id: 'toeic-10',
          title: 'TOEIC Full Test 10 (2024)',
          category: 'Full Test',
          categoryBadge: 'TOEIC',
          categoryBadgeClass: 'bg-blue-600 text-white',
          attempts: 2934,
          avgScore: '78.4%',
          likes: 128,
        },
        {
          rank: 2,
          id: 'reading-7',
          title: 'Reading Practice Set 7',
          category: 'Reading',
          categoryBadge: 'READING',
          categoryBadgeClass: 'bg-teal-600 text-white',
          attempts: 1987,
          avgScore: '71.2%',
          likes: 96,
        },
        {
          rank: 3,
          id: 'listening-5',
          title: 'Listening Practice Set 5',
          category: 'Listening',
          categoryBadge: 'LISTENING',
          categoryBadgeClass: 'bg-indigo-600 text-white',
          attempts: 1652,
          avgScore: '69.1%',
          likes: 84,
        },
        {
          rank: 4,
          id: 'grammar-3',
          title: 'Grammar Quiz - Advanced #3',
          category: 'Grammar',
          categoryBadge: 'GRAMMAR',
          categoryBadgeClass: 'bg-emerald-600 text-white',
          attempts: 1243,
          avgScore: '74.8%',
          likes: 67,
        },
        {
          rank: 5,
          id: 'vocab-3',
          title: 'Business Vocabulary Set 3',
          category: 'Vocabulary',
          categoryBadge: 'VOCAB',
          categoryBadgeClass: 'bg-rose-600 text-white',
          attempts: 1102,
          avgScore: '68.3%',
          likes: 55,
        },
      ],
      revenue: {
        totalRevenue: '$452.60',
        revenueGrowth: '+12.6% vs last month',
        payoutBalance: '$186.30',
        dailyData: [
          { day: 'May 1', amount: 20 },
          { day: 'May 2', amount: 45 },
          { day: 'May 3', amount: 35 },
          { day: 'May 4', amount: 60 },
          { day: 'May 5', amount: 40 },
          { day: 'May 6', amount: 75 },
          { day: 'May 7', amount: 50 },
          { day: 'May 8', amount: 90 },
          { day: 'May 9', amount: 110 },
          { day: 'May 10', amount: 65 },
          { day: 'May 11', amount: 70 },
          { day: 'May 12', amount: 85 },
          { day: 'May 13', amount: 40 },
          { day: 'May 14', amount: 95 },
          { day: 'May 15', amount: 120 },
          { day: 'May 16', amount: 105 },
        ],
      },
    }),
    []
  );

  const dashboardData = useMemo(() => {
    if (apiData && typeof apiData === 'object' && Object.keys(apiData).length > 0) {
      return { ...defaultData, ...apiData };
    }
    return defaultData;
  }, [apiData, defaultData]);

  // Chart data based on selected active tab
  const currentChartSeries = useMemo(() => {
    const chart = dashboardData.performanceChart;
    if (activeChartTab === 'Attempts') return { label: 'Attempts', data: chart.attempts };
    if (activeChartTab === 'Average Score') return { label: 'Average Score (%)', data: chart.averageScores };
    if (activeChartTab === 'Likes') return { label: 'Likes', data: chart.likes };
    return { label: 'Revenue ($)', data: chart.revenue };
  }, [dashboardData, activeChartTab]);

  const handleCreateNewExam = () => {
    navigate('/certification/create-exam');
  };

  const handleAIGenerateQuestions = () => {
    navigate('/certification/ai-generator');
  };

  const handleImportQuestions = () => {
    navigate('/certification/import-questions');
  };

  const handleCreateCollection = () => {
    navigate('/certification/create-collection');
  };

  const handleViewAnalytics = () => {
    navigate('/certification/analytics');
  };

  const handleWithdraw = () => {
    window.alert('Withdrawal request initiated for $' + dashboardData.revenue.payoutBalance);
  };

  const handleBackToLearning = () => {
    navigate('/certification/library');
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
    handleCreateNewExam,
    handleAIGenerateQuestions,
    handleImportQuestions,
    handleCreateCollection,
    handleViewAnalytics,
    handleWithdraw,
    handleBackToLearning,
  };
}
