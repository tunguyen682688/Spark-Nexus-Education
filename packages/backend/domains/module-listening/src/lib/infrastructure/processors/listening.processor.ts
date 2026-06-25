import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { LISTENING_REPOSITORY } from '../../domain/repositories/listening.repository.interface';
import type { IListeningRepository } from '../../domain/repositories/listening.repository.interface';
import { ListeningCacheService } from '../cache/listening-cache.service';

/**
 * ListeningProcessor
 *
 * BullMQ processor for processing tasks related to the Listening module background workers.
 * Listens to the 'listening-tasks' queue.
 */
@Processor('listening-tasks')
export class ListeningProcessor extends WorkerHost {
  private readonly logger = new Logger(ListeningProcessor.name);

  constructor(
    @Inject(LISTENING_REPOSITORY)
    private readonly listeningRepository: IListeningRepository,
    private readonly cacheService: ListeningCacheService
  ) {
    super();
  }

  /**
   * Main entry point for processing queue jobs
   */
  async process(job: Job<unknown>): Promise<void> {
    this.logger.log(`Processing background job ${job.id} of type "${job.name}"`);

    switch (job.name) {
      case 'warm-material-cache':
        await this.handleWarmMaterialCache(job as Job<{ materialId: string }>);
        break;
      case 'aggregate-user-listening-stats':
        await this.handleAggregateUserListeningStats(job as Job<{
          userId: string;
          materialId: string;
          timeSpent: number;
        }>);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        break;
    }
  }

  /**
   * Handle 'warm-material-cache' job
   * Invalidates lists and warms up details cache
   */
  private async handleWarmMaterialCache(job: Job<{ materialId: string }>): Promise<void> {
    const { materialId } = job.data;
    this.logger.log(`[Worker] Warming cache for material: ${materialId}`);

    try {
      // Invalidate existing material list cache patterns
      await this.cacheService.clearPattern('listening:materials:raw:*');

      // Warm up details cache by calling findMaterialById
      const material = await this.listeningRepository.findMaterialById(materialId);
      if (material) {
        this.logger.log(`[Worker] Cache warmed successfully for material: ${material.title}`);
      } else {
        this.logger.warn(`[Worker] Material ${materialId} not found during cache warming`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[Worker] Error warming cache for material ${materialId}: ${msg}`, error);
    }
  }

  /**
   * Handle 'aggregate-user-listening-stats' job
   * Performs heavy DB aggregation for total minutes listened and streaks in background
   */
  private async handleAggregateUserListeningStats(job: Job<{
    userId: string;
    materialId: string;
    timeSpent: number;
  }>): Promise<void> {
    const { userId, materialId } = job.data;
    this.logger.log(
      `[Worker] Aggregating stats for user ${userId} triggered by material ${materialId}`
    );

    try {
      // Fetch user progress lists
      const allProgress = await this.listeningRepository.findAllProgressByUserId(userId);
      const totalMaterials = allProgress.filter(
        (p) => p.progress >= 100 || p.completedAt !== null
      ).length;
      const totalTime = allProgress.reduce((sum, p) => sum + p.timeSpent, 0);

      // Async write to db
      await this.listeningRepository.upsertUserStats(userId, totalMaterials, totalTime);
      this.logger.log(`[Worker] User listening stats updated successfully for user ${userId}`);

      // Invalidate stats cache
      const cacheKey = `listening:user-stats:${userId}`;
      await this.cacheService.delete(cacheKey);

      // Re-warm user stats cache
      await this.listeningRepository.findUserStats(userId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[Worker] Failed to update UserListeningStats in background: ${msg}`, err);
      throw err; // Allow BullMQ retry
    }
  }
}
