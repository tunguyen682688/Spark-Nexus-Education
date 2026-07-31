import { Query } from '@nestjs/cqrs';

export interface CreatorDashboardResult {
  id: string;
  metrics: {
    totalExams: number;
    totalExamsWeeklyChange: string;
    totalQuestions: number;
    totalQuestionsWeeklyChange: string;
    totalAttempts: number;
    totalAttemptsWeeklyChange: string;
    averageScore: number;
    averageScoreWeeklyChange: string;
    totalLikes: number;
    likesReceived: number;
    likesReceivedWeeklyChange: string;
  };
  performanceChart: {
    timeframe: string;
    dates: string[];
    attempts: number[];
    averageScores: number[];
    likes: number[];
    revenue: number[];
  };
  topExams: Array<{
    rank: number;
    id: string;
    title: string;
    category: string;
    categoryBadge: string;
    categoryBadgeClass: string;
    attempts: number;
    avgScore: string;
    likes: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    timestamp: string;
    iconType: 'check' | 'document' | 'star' | 'comment' | 'heart';
    iconBgClass: string;
  }>;
  revenue: {
    totalRevenue: string;
    revenueGrowth: string;
    payoutBalance: string;
    dailyData: Array<{ day: string; amount: number }>;
  };
}

export class GetCreatorDashboardQuery extends Query<CreatorDashboardResult> {
  constructor(public readonly userId: string) {
    super();
  }
}
