import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCertificationDashboardQuery } from './get-certification-dashboard.query';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';

@QueryHandler(GetCertificationDashboardQuery)
export class GetCertificationDashboardQueryHandler implements IQueryHandler<GetCertificationDashboardQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCertificationDashboardQuery) {
    // Fetch user activity, exam results and database totals directly from repository
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

    // Calculate actual learning time in minutes from ended exam sessions
    let learningTimeMinutes = 0;
    for (const session of sessions) {
      const endedAt = session.getEndedAt();
      if (endedAt) {
        const durationMs = endedAt.getTime() - session.getStartedAt().getTime();
        learningTimeMinutes += Math.round(durationMs / 60000);
      }
    }

    // Dynamic streak days based on unique session start dates
    const uniqueStudyDays = new Set(sessions.map((s) => s.getStartedAt().toDateString()));
    const streakDays = uniqueStudyDays.size;

    // Calculate XP earned: 50 XP per completed exam + 10 XP per study day
    const xpEarned = examsCompleted * 50 + streakDays * 10;

    // Global rank formula based on XP earned
    const globalRank = examsCompleted > 0 ? Math.max(1, 5000 - xpEarned * 3) : 0;

    return {
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
