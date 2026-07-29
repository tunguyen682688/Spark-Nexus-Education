import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCertificationDashboardQuery } from './get-certification-dashboard.query';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';

@QueryHandler(GetCertificationDashboardQuery)
export class GetCertificationDashboardQueryHandler implements IQueryHandler<GetCertificationDashboardQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCertificationDashboardQuery) {
    const [examsResult, collectionsResult, sessions, results] = await Promise.all([
      this.repository.findExams({ limit: 1 }),
      this.repository.findCollections({ limit: 1 }),
      this.repository.findSessionsByUserId(query.userId),
      this.repository.findResultsByUserId(query.userId),
    ]);

    const examsCompleted = results.length;

    const averageScore = examsCompleted > 0
      ? parseFloat((results.reduce((sum, r) => sum + r.getTotalScore(), 0) / examsCompleted).toFixed(1))
      : 0;

    let learningTimeMinutes = 0;
    for (const session of sessions) {
      const endedAt = session.getEndedAt();
      if (endedAt) {
        const durationMs = endedAt.getTime() - session.getStartedAt().getTime();
        learningTimeMinutes += Math.round(durationMs / 60000);
      }
    }

    const uniqueStudyDays = new Set(sessions.map((s) => s.getStartedAt().toDateString()));
    const streakDays = uniqueStudyDays.size;
    const xpEarned = examsCompleted * 50 + streakDays * 10;
    const globalRank = examsCompleted > 0 ? Math.max(1, 5000 - xpEarned * 3) : 0;

    const scorePredictionStr = averageScore > 0 ? `${averageScore}` : null;
    const accuracyStr = examsCompleted > 0 ? `${Math.round((results.filter((r) => r.isPassed()).length / examsCompleted) * 100)}%` : null;
    const hoursSpent = Math.round((learningTimeMinutes / 60) * 10) / 10;

    return {
      scorePrediction: scorePredictionStr,
      scoreRange: averageScore > 0 ? `Target: ${Math.round(averageScore * 1.1)}` : null,
      accuracy: accuracyStr,
      timeSpent: hoursSpent > 0 ? `${hoursSpent}h` : null,
      completedMocks: `${examsCompleted}`,
      targetExam: examsCompleted > 0 ? 'TOEIC' : null,
      targetScore: averageScore > 0 ? `${Math.round(averageScore * 1.1)}` : null,
      daysRemaining: streakDays > 0 ? Math.max(1, 30 - streakDays) : null,
      learningTime: learningTimeMinutes,
      examsCompleted,
      averageScore,
      globalRank,
      streakDays,
      xpEarned,
      totalExamsInSystem: examsResult.total,
      totalCollectionsInSystem: collectionsResult.total,
    };
  }
}
