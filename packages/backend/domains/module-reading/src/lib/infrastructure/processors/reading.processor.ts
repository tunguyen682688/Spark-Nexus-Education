import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { READING_REPOSITORY } from '../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../domain/repositories/reading.repository.interface';

/**
 * ReadingProcessor
 *
 * BullMQ processor for asynchronously processing Reading context operations.
 * Processes jobs from the 'reading-tasks' queue.
 */
@Processor('reading-tasks')
export class ReadingProcessor extends WorkerHost {
  private readonly logger = new Logger(ReadingProcessor.name);

  constructor(
    @Inject(READING_REPOSITORY)
    private readonly repository: IReadingRepository
  ) {
    super();
  }

  async process(job: Job<unknown>): Promise<void> {
    this.logger.log(`Processing background job ${job.id} of type "${job.name}"`);

    switch (job.name) {
      case 'process-reading-completion':
        await this.handleReadingCompletion(job as Job<{
          userId: string;
          articleId: string;
          timeSpent: number;
          completedAt: string;
        }>);
        break;
      case 'process-quiz-result':
        await this.handleQuizResult(job as Job<{
          userId: string;
          articleId: string;
          score: number;
          correctCount: number;
          totalQuestions: number;
        }>);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        break;
    }
  }

  /**
   * Handle 'process-reading-completion' job
   */
  private async handleReadingCompletion(job: Job<{
    userId: string;
    articleId: string;
    timeSpent: number;
    completedAt: string;
  }>): Promise<void> {
    const { userId, articleId, timeSpent, completedAt } = job.data;
    this.logger.log(
      `[Worker] Processing reading completion for user ${userId}, article ${articleId}. Time spent: ${timeSpent}s, completed at: ${completedAt}`
    );

    // Fetch user stats to simulate processing
    const stats = await this.repository.findUserStats(userId);
    this.logger.log(
      `[Worker] Current user stats: Total Articles: ${stats.totalArticles}, WPM: ${stats.avgWpm}, Mastery: ${stats.masteryLevel}`
    );

    // Update progress tracking (e.g. daily streaks, reading speed logs, experience points)
    // Here we can run heavy data analytics, cache pre-computation, or send push notifications.
    this.logger.log(`[Worker] Reading analytics calculated successfully for user ${userId}`);
  }

  /**
   * Handle 'process-quiz-result' job
   */
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

    // In a real-world scenario, we could look up the article category/CEFR level,
    // evaluate the student's mastery of grammar/vocabulary featured in the article,
    // and save updated indicators.
    const article = await this.repository.findArticleById(articleId);
    if (article) {
      this.logger.log(
        `[Worker] Evaluated mastery of category "${article.getCategory()}" at difficulty level "${article.getDifficulty().getValue()}"`
      );
    }

    this.logger.log(`[Worker] Mastery tracking updated successfully for user ${userId}`);
  }
}
