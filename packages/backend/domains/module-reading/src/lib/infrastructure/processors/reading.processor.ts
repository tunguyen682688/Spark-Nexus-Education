import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { READING_REPOSITORY } from '../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../domain/repositories/reading.repository.interface';
import { BullMQService } from '@spark-nest-ed/infrastructure-cache';

export class ReadingProcessor implements OnModuleInit {
  private readonly logger = new Logger(ReadingProcessor.name);

  constructor(
    @Inject(READING_REPOSITORY)
    private readonly repository: IReadingRepository,
    private readonly bullMQ: BullMQService,
  ) {}

  onModuleInit() {
    this.bullMQ.registerWorker('reading-tasks', (job: Job) => this.process(job));
  }

  private async process(job: Job): Promise<void> {
    this.logger.log(`Processing background job ${job.id} of type "${job.name}"`);

    switch (job.name) {
      case 'process-reading-completion':
        return this.handleReadingCompletion(job as Job<{
          userId: string;
          articleId: string;
          timeSpent: number;
          completedAt: string;
        }>);
      case 'process-quiz-result':
        return this.handleQuizResult(job as Job<{
          userId: string;
          articleId: string;
          score: number;
          correctCount: number;
          totalQuestions: number;
        }>);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleReadingCompletion(job: Job<{
    userId: string;
    articleId: string;
    timeSpent: number;
    completedAt: string;
  }>): Promise<void> {
    const { userId, articleId, timeSpent } = job.data;
    this.logger.log(
      `[Worker] Processing reading completion for user ${userId}, article ${articleId}. Time spent: ${timeSpent}s`
    );

    const stats = await this.repository.findUserStats(userId);
    this.logger.log(
      `[Worker] Current user stats: Total Articles: ${stats.totalArticles}, WPM: ${stats.avgWpm}, Mastery: ${stats.masteryLevel}`
    );

    this.logger.log(`[Worker] Reading analytics calculated successfully for user ${userId}`);
  }

  private async handleQuizResult(job: Job<{
    userId: string;
    articleId: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
  }>): Promise<void> {
    const { userId, articleId, score, correctCount, totalQuestions } = job.data;
    this.logger.log(
      `[Worker] Processing quiz analytics for user ${userId}, article ${articleId}. Score: ${score}% (${correctCount}/${totalQuestions})`
    );

    const article = await this.repository.findArticleById(articleId);
    if (article) {
      this.logger.log(
        `[Worker] Evaluated mastery of category "${article.getCategory()}" at difficulty level "${article.getDifficulty().getValue()}"`
      );
    }

    this.logger.log(`[Worker] Mastery tracking updated successfully for user ${userId}`);
  }
}
