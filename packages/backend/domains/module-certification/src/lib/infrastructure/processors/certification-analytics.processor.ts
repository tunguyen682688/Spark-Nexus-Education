import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';
import { CertificationCacheService } from '../cache/certification-cache.service';

const STATS_KEY_PREFIX = 'certification:user-stats:';
const STATS_TTL = 1800;

interface UserCertificationStats {
  userId: string;
  totalSessionsCompleted: number;
  lastExamAt: string | null;
  updatedAt: string;
}

@Processor('certification-analytics')
export class CertificationAnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificationAnalyticsProcessor.name);

  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository,
    private readonly cacheService: CertificationCacheService,
  ) {
    super();
  }

  async process(job: Job<unknown>): Promise<void> {
    this.logger.log(`[Analytics] Processing job ${job.id} "${job.name}"`);

    switch (job.name) {
      case 'process-exam-analytics':
        await this.handleExamAnalytics(job as Job<{
          sessionId: string;
          examId: string;
          userId: string;
          score: number;
          passed: boolean;
          submittedAt: string;
        }>);
        break;
      case 'aggregate-user-certification-stats':
        await this.handleAggregateUserStats(job as Job<{
          userId: string;
        }>);
        break;
      default:
        this.logger.warn(`[Analytics] Unknown job name: ${job.name}`);
        break;
    }
  }

  private async handleExamAnalytics(job: Job<{
    sessionId: string;
    examId: string;
    userId: string;
    score: number;
    passed: boolean;
    submittedAt: string;
  }>): Promise<void> {
    const { sessionId, examId, userId, score, passed } = job.data;
    this.logger.log(
      `[Analytics] Exam completed: user=${userId}, session=${sessionId}, score=${score}, passed=${passed}`
    );

    const exam = await this.repository.findExamById(examId);
    if (exam) {
      this.logger.log(
        `[Analytics] Exam: "${exam.getTitle()}", type: ${exam.getCertificationType()}`
      );
    }

    const session = await this.repository.findSessionById(sessionId);
    if (session) {
      this.logger.log(
        `[Analytics] Session duration: ${session.getStartedAt().toISOString()} → ${session.getEndedAt()?.toISOString() || 'ongoing'}`
      );
    }

    // Invalidate user stats cache
    await this.cacheService.delete(`${STATS_KEY_PREFIX}${userId}`);
    await this.cacheService.delete(`certification:dashboard:${userId}`);

    await job.updateProgress(100);
    this.logger.log(`[Analytics] Analytics completed for session ${sessionId}`);
  }

  private async handleAggregateUserStats(job: Job<{
    userId: string;
  }>): Promise<void> {
    const { userId } = job.data;
    const statsKey = `${STATS_KEY_PREFIX}${userId}`;

    this.logger.log(`[Analytics] Aggregating stats for user ${userId}`);

    try {
      const sessions = await this.repository.findSessionsByUserId(userId);
      const completedSessions = sessions.filter((s) => s.getStatus() === 'completed');

      const stats: UserCertificationStats = {
        userId,
        totalSessionsCompleted: completedSessions.length,
        lastExamAt: completedSessions.length > 0
          ? (completedSessions[completedSessions.length - 1].getEndedAt() || completedSessions[completedSessions.length - 1].getStartedAt()).toISOString()
          : null,
        updatedAt: new Date().toISOString(),
      };

      await this.cacheService.set(statsKey, stats, STATS_TTL);

      await job.updateProgress(100);
      this.logger.log(`[Analytics] Stats aggregated for user ${userId}: ${stats.totalSessionsCompleted} sessions completed`);
    } catch (error) {
      this.logger.error(`[Analytics] Failed to aggregate stats for user ${userId}`, error);
      throw error;
    }
  }
}
