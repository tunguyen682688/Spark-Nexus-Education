import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common';
import { LISTENING_REPOSITORY } from '../../domain/repositories/listening.repository.interface';
import type { IListeningRepository } from '../../domain/repositories/listening.repository.interface';
import { ListeningCacheService } from '../cache/listening-cache.service';
import { BullMQService } from '@spark-nest-ed/infrastructure-cache';

export class ListeningProcessor implements OnModuleInit {
  private readonly logger = new Logger(ListeningProcessor.name);

  constructor(
    @Inject(LISTENING_REPOSITORY)
    private readonly listeningRepository: IListeningRepository,
    private readonly cacheService: ListeningCacheService,
    private readonly bullMQ: BullMQService,
  ) {}

  onModuleInit() {
    this.bullMQ.registerWorker('listening-tasks', (job) => this.process(job));
  }

  private async process(job: Job): Promise<void> {
    this.logger.log(`Processing background job ${job.id} of type "${job.name}"`);

    switch (job.name) {
      case 'warm-material-cache':
        return this.handleWarmMaterialCache(job as Job<{ materialId: string }>);
      case 'aggregate-user-listening-stats':
        return this.handleAggregateUserListeningStats(job as Job<{
          userId: string;
          materialId: string;
          timeSpent: number;
        }>);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleWarmMaterialCache(job: Job<{ materialId: string }>): Promise<void> {
    const { materialId } = job.data;
    this.logger.log(`[Worker] Warming cache for material: ${materialId}`);

    try {
      await this.cacheService.clearPattern('listening:materials:raw:*');

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
      const allProgress = await this.listeningRepository.findAllProgressByUserId(userId);
      const totalMaterials = allProgress.filter(
        (p) => p.progress >= 100 || p.completedAt !== null
      ).length;
      const totalTime = allProgress.reduce((sum, p) => sum + p.timeSpent, 0);

      await this.listeningRepository.upsertUserStats(userId, totalMaterials, totalTime);
      this.logger.log(`[Worker] User listening stats updated successfully for user ${userId}`);

      const cacheKey = `listening:user-stats:${userId}`;
      await this.cacheService.delete(cacheKey);

      await this.listeningRepository.findUserStats(userId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[Worker] Failed to update UserListeningStats in background: ${msg}`, err);
      throw err;
    }
  }
}
