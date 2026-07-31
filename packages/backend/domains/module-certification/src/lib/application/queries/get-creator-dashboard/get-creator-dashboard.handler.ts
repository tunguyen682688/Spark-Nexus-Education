import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetCreatorDashboardQuery, CreatorDashboardResult } from './get-creator-dashboard.query';

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

@QueryHandler(GetCreatorDashboardQuery)
export class GetCreatorDashboardQueryHandler implements IQueryHandler<GetCreatorDashboardQuery, CreatorDashboardResult> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCreatorDashboardQuery): Promise<CreatorDashboardResult> {
    const [examsResult, , sessions, results] = await Promise.all([
      this.repository.findExams({ limit: 200 }),
      this.repository.findCollections({ limit: 200 }),
      this.repository.findSessionsByUserId(query.userId),
      this.repository.findResultsByUserId(query.userId),
    ]);

    const totalExams = examsResult.total;
    const totalQuestions = examsResult.items.reduce((sum, e) => sum + e.getTotalQuestions(), 0);
    const totalAttempts = results.length;

    const averageScore = totalAttempts > 0
      ? parseFloat((results.reduce((sum, r) => sum + r.getTotalScore(), 0) / totalAttempts).toFixed(1))
      : 0;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentResults = results.filter((r) => r.createdAt >= sevenDaysAgo);
    const previousResults = results.filter((r) => r.createdAt >= fourteenDaysAgo && r.createdAt < sevenDaysAgo);

    const recentAttempts = recentResults.length;
    const previousAttempts = previousResults.length;
    const attemptsDiff = recentAttempts - previousAttempts;

    const recentSessions = sessions.filter((s) => s.getStartedAt() >= sevenDaysAgo);

    const dates: string[] = [];
    const attemptsData: number[] = [];
    const averageScoresData: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push(dayStr);

      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayResults = results.filter((r) => r.createdAt >= dayStart && r.createdAt < dayEnd);
      attemptsData.push(dayResults.length);

      const dayAvg = dayResults.length > 0
        ? parseFloat((dayResults.reduce((s, r) => s + r.getTotalScore(), 0) / dayResults.length).toFixed(1))
        : 0;
      averageScoresData.push(dayAvg);
    }

    const examAttempts = new Map<string, number>();
    for (const result of results) {
      const sessionId = result.getSessionId();
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        const count = examAttempts.get(session.getExamId()) || 0;
        examAttempts.set(session.getExamId(), count + 1);
      }
    }

    const topExams = examsResult.items
      .map((exam) => {
        const examAttemptsCount = examAttempts.get(exam.id) || 0;
        const examResults = results.filter((r) => {
          const sessionId = r.getSessionId();
          const session = sessions.find((s) => s.id === sessionId);
          return session && session.getExamId() === exam.id;
        });
        const examAvg = examResults.length > 0
          ? parseFloat((examResults.reduce((s, r) => s + r.getTotalScore(), 0) / examResults.length).toFixed(1))
          : averageScore;

        const title = exam.getTitle().toUpperCase();
        let category = 'General';
        let categoryBadge = 'EXAM';
        let categoryBadgeClass = 'bg-slate-600 text-white';
        if (title.includes('TOEIC')) {
          category = 'Full Test';
          categoryBadge = 'TOEIC';
          categoryBadgeClass = 'bg-blue-600 text-white';
        } else if (title.includes('IELTS')) {
          category = 'Full Test';
          categoryBadge = 'IELTS';
          categoryBadgeClass = 'bg-rose-600 text-white';
        } else if (title.includes('TOEFL')) {
          category = 'Full Test';
          categoryBadge = 'TOEFL';
          categoryBadgeClass = 'bg-emerald-600 text-white';
        } else if (title.includes('CAMBRIDGE') || title.includes('CAE')) {
          category = 'Full Test';
          categoryBadge = 'CAMBRIDGE';
          categoryBadgeClass = 'bg-purple-600 text-white';
        } else if (title.includes('VSTEP')) {
          category = 'Full Test';
          categoryBadge = 'VSTEP';
          categoryBadgeClass = 'bg-indigo-600 text-white';
        } else if (title.includes('SAT')) {
          category = 'Full Test';
          categoryBadge = 'SAT';
          categoryBadgeClass = 'bg-amber-600 text-white';
        } else if (title.includes('READING')) {
          category = 'Reading';
          categoryBadge = 'READING';
          categoryBadgeClass = 'bg-teal-600 text-white';
        } else if (title.includes('LISTENING')) {
          category = 'Listening';
          categoryBadge = 'LISTENING';
          categoryBadgeClass = 'bg-indigo-600 text-white';
        } else if (title.includes('GRAMMAR')) {
          category = 'Grammar';
          categoryBadge = 'GRAMMAR';
          categoryBadgeClass = 'bg-emerald-600 text-white';
        } else if (title.includes('WRITING')) {
          category = 'Writing';
          categoryBadge = 'WRITING';
          categoryBadgeClass = 'bg-amber-600 text-white';
        } else if (title.includes('SPEAKING')) {
          category = 'Speaking';
          categoryBadge = 'SPEAKING';
          categoryBadgeClass = 'bg-rose-600 text-white';
        } else if (title.includes('VOCAB')) {
          category = 'Vocabulary';
          categoryBadge = 'VOCAB';
          categoryBadgeClass = 'bg-rose-600 text-white';
        }

        return {
          id: exam.id,
          title: exam.getTitle(),
          category,
          categoryBadge,
          categoryBadgeClass,
          attempts: examAttemptsCount,
          avgScore: `${examAvg}%`,
        };
      })
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 5)
      .map((exam, idx) => ({
        rank: idx + 1,
        ...exam,
        likes: 0,
      }));

    const recentActivity = recentSessions.slice(0, 5).map((session, idx) => {
      const icons: Array<'check' | 'document' | 'star' | 'comment' | 'heart'> = ['check', 'document', 'star', 'comment', 'heart'];
      const bgClasses = [
        'bg-emerald-100 text-emerald-600',
        'bg-purple-100 text-purple-600',
        'bg-amber-100 text-amber-600',
        'bg-blue-100 text-blue-600',
        'bg-rose-100 text-rose-600',
      ];
      const sessionExam = sessions.find((s) => s.id === session.id);
      let examTitle = 'Unknown Exam';
      if (sessionExam) {
        const exam = examsResult.items.find((e) => e.id === sessionExam.getExamId());
        if (exam) examTitle = exam.getTitle();
      }
      const timeAgo = getTimeAgo(session.getStartedAt());
      return {
        id: `act-${idx + 1}`,
        type: 'session',
        title: `Completed "${examTitle}"`,
        timestamp: timeAgo,
        iconType: icons[idx % icons.length],
        iconBgClass: bgClasses[idx % bgClasses.length],
      };
    });

    const totalRevenue = totalAttempts * 0.5;
    const previousRevenue = previousAttempts * 0.5;
    const revenueGrowthPercent = previousRevenue > 0
      ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
      : '0';
    const revenueGrowth = attemptsDiff > 0 ? `+${revenueGrowthPercent}% vs last week` : '0% vs last week';

    return {
      id: `creator-${query.userId}`,
      metrics: {
        totalExams,
        totalExamsWeeklyChange: `+${Math.min(totalExams, 3)} this week`,
        totalQuestions,
        totalQuestionsWeeklyChange: `+${Math.min(totalQuestions, 50)} this week`,
        totalAttempts,
        totalAttemptsWeeklyChange: `+${attemptsDiff} this week`,
        averageScore,
        averageScoreWeeklyChange: '+0% vs last week',
        totalLikes: 0,
        likesReceived: 0,
        likesReceivedWeeklyChange: '+0 this week',
      },
      performanceChart: {
        timeframe: 'Last 7 Days',
        dates,
        attempts: attemptsData,
        averageScores: averageScoresData,
        likes: attemptsData.map(() => 0),
        revenue: attemptsData.map((a) => a * 0.5),
      },
      topExams,
      recentActivity,
      revenue: {
        totalRevenue: `$${totalRevenue.toFixed(2)}`,
        revenueGrowth,
        payoutBalance: `$${(totalRevenue * 0.4).toFixed(2)}`,
        dailyData: dates.map((day, i) => ({ day, amount: parseFloat((attemptsData[i] * 0.5).toFixed(2)) })),
      },
    };
  }
}
