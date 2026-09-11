import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';
import { CertificationCacheService } from '../cache/certification-cache.service';
import { BullMQService } from '@spark-nest-ed/infrastructure-cache';

export class CertificationProcessor implements OnModuleInit {
  private readonly logger = new Logger(CertificationProcessor.name);

  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository,
    private readonly cacheService: CertificationCacheService,
    private readonly bullMQ: BullMQService,
  ) {}

  onModuleInit() {
    this.bullMQ.registerWorker('certification-tasks', (job) => this.process(job));
  }

  private async process(job: Job): Promise<void> {
    this.logger.log(`[Certification] Processing job ${job.id} "${job.name}"`);

    switch (job.name) {
      case 'calculate-exam-score':
        return this.handleCalculateScore(job as Job<{ sessionId: string; examId: string; userId: string }>);
      case 'process-exam-analytics':
        return this.handleExamAnalytics(job as Job<{ sessionId: string; examId: string; userId: string }>);
      case 'aggregate-user-certification-stats':
        return this.handleAggregateUserStats(job as Job<{ userId: string }>);
      case 'publish-collection':
        return this.handlePublishCollection(job as Job<{ collectionId: string; userId: string }>);
      default:
        this.logger.warn(`[Certification] Unknown job name: ${job.name}`);
    }
  }

  private async handleCalculateScore(job: Job<{ sessionId: string; examId: string; userId: string }>): Promise<void> {
    const { sessionId, examId, userId } = job.data;
    const scoreKey = `certification:score:${sessionId}`;

    try {
      await this.cacheService.set(scoreKey, {
        sessionId, examId, userId, totalPoints: 0, maxPoints: 0, percentage: 0,
        bandScore: null, passed: false, sectionScores: [], status: 'scoring',
      } as Record<string, unknown>, 3600);

      const exam = await this.repository.findExamById(examId);
      if (!exam) throw new Error(`Exam ${examId} not found`);

      const sections = await this.repository.findSectionsByExamId(examId);
      const examSession = await this.repository.findSessionById(sessionId);
      if (!examSession) throw new Error(`Session ${sessionId} not found`);

      const sessionAnswers = await this.repository.findAnswersBySessionId(sessionId);
      const answerMap = new Map<string, string[]>();
      for (const answer of sessionAnswers) {
        answerMap.set(answer.getQuestionId(), answer.getChoiceIds());
      }

      let totalPoints = 0;
      let maxPoints = 0;
      const sectionScores: Array<{ sectionId: string; sectionTitle: string; correctCount: number; totalQuestions: number; points: number; maxPoints: number }> = [];

      for (const section of sections) {
        const sectionQuestions = await this.repository.findExamQuestionsByExamIdAndSectionId(examId, section.id);
        let sectionCorrect = 0;
        let sectionPoints = 0;
        let sectionMaxPoints = 0;

        for (const eq of sectionQuestions) {
          const points = eq.getPoints() || 1;
          sectionMaxPoints += points;
          maxPoints += points;

          const selectedChoiceIds = answerMap.get(eq.getQuestionId());
          if (selectedChoiceIds && selectedChoiceIds.length > 0) {
            const choices = await this.repository.findChoicesByQuestionId(eq.getQuestionId());
            const correctChoice = choices.find((c) => c.getIsCorrect());
            if (correctChoice && selectedChoiceIds.includes(correctChoice.id)) {
              sectionCorrect++;
              sectionPoints += points;
              totalPoints += points;
            }
          }
        }

        sectionScores.push({
          sectionId: section.id, sectionTitle: section.getTitle(),
          correctCount: sectionCorrect, totalQuestions: sectionQuestions.length,
          points: sectionPoints, maxPoints: sectionMaxPoints,
        });

        await job.updateProgress(Math.round((sectionScores.length / sections.length) * 100));
      }

      const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
      const passScore = exam.getPassScore() || 450;
      const maxScore = exam.getMaxScore() || 990;
      const bandScore = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * maxScore) : 0;

      examSession.complete();
      await this.repository.saveSession(examSession);

      await this.cacheService.set(scoreKey, {
        sessionId, examId, userId, totalPoints, maxPoints, percentage,
        bandScore, passed: bandScore >= passScore, sectionScores, status: 'completed',
      } as Record<string, unknown>, 3600);

      await job.updateProgress(100);
      this.logger.log(`[Certification] Score: ${bandScore}/${maxScore} (${percentage}%)`);
    } catch (error) {
      this.logger.error(`[Certification] Failed to score session ${sessionId}`, error);
      await this.cacheService.set(scoreKey, {
        sessionId, examId, userId, totalPoints: 0, maxPoints: 0, percentage: 0,
        bandScore: null, passed: false, sectionScores: [], status: 'failed',
      } as Record<string, unknown>, 3600);
      throw error;
    }
  }

  private async handleExamAnalytics(job: Job<{ sessionId: string; examId: string; userId: string }>): Promise<void> {
    const { userId } = job.data;
    this.logger.log(`[Certification] Analytics: session=${job.data.sessionId}`);

    await this.cacheService.delete(`certification:user-stats:${userId}`);
    await this.cacheService.delete(`certification:dashboard:${userId}`);
    await job.updateProgress(100);
  }

  private async handleAggregateUserStats(job: Job<{ userId: string }>): Promise<void> {
    const { userId } = job.data;
    const statsKey = `certification:user-stats:${userId}`;

    const sessions = await this.repository.findSessionsByUserId(userId);
    const completedSessions = sessions.filter((s) => s.getStatus() === 'completed');

    await this.cacheService.set(statsKey, {
      userId,
      totalSessionsCompleted: completedSessions.length,
      lastExamAt: completedSessions.length > 0
        ? (completedSessions[completedSessions.length - 1].getEndedAt() || completedSessions[completedSessions.length - 1].getStartedAt()).toISOString()
        : null,
      updatedAt: new Date().toISOString(),
    }, 1800);

    await job.updateProgress(100);
  }

  private async handlePublishCollection(job: Job<{ collectionId: string; userId: string }>): Promise<void> {
    const { collectionId } = job.data;
    this.logger.log(`[Certification] Publishing collection ${collectionId}`);

    const collection = await this.repository.findCollectionById(collectionId);
    if (!collection) throw new Error(`Collection ${collectionId} not found`);

    const chapters = await this.repository.findChaptersByCollectionId(collectionId);
    const issues: string[] = [];

    for (const chapter of chapters) {
      const exams = await this.repository.findExamsByChapterId(chapter.id);
      for (const exam of exams) {
        const questions = await this.repository.findExamQuestionsByExamId(exam.id);
        if (questions.length === 0) {
          issues.push(`Exam "${exam.getTitle()}" has no questions`);
        }
      }
    }

    if (issues.length > 0) throw new Error(`Cannot publish: ${issues.join('; ')}`);

    collection.update({ publishStatus: 'published' });
    await this.repository.saveCollection(collection);

    await this.cacheService.delete(`certification:collections:${collectionId}`);
    await this.cacheService.delete(`certification:editor:${collectionId}`);
    await job.updateProgress(100);
  }
}
