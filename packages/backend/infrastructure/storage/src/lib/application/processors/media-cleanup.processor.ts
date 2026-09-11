import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { OnModuleInit } from '@nestjs/common';
import { MEDIA_FILE_REPOSITORY } from '../../domain/media-file.repository.interface';
import type { IMediaFileRepository } from '../../domain/media-file.repository.interface';
import type { IObjectStorage } from '../../domain/object-storage.interface';
import { BullMQService } from '@spark-nest-ed/infrastructure-cache';

export class MediaCleanupProcessor implements OnModuleInit {
  private readonly logger = new Logger(MediaCleanupProcessor.name);

  constructor(
    @Inject(MEDIA_FILE_REPOSITORY) private readonly repo: IMediaFileRepository,
    @Inject('IObjectStorage') private readonly storage: IObjectStorage,
    private readonly bullMQ: BullMQService,
  ) {}

  onModuleInit() {
    this.bullMQ.registerWorker('media-cleanup', (job: Job) => this.process(job));
  }

  private async process(job: Job): Promise<void> {
    this.logger.log('Starting media cleanup...');

    const expiredFiles = await this.repo.findExpiredSoftDeletes(30);
    let cleaned = 0;

    for (const file of expiredFiles) {
      try {
        await this.storage.delete(file.getStorageKey());
        await this.repo.hardDelete(file.id);
        cleaned++;
        this.logger.debug(`Cleaned up: ${file.getStorageKey()}`);
      } catch (error) {
        this.logger.error(`Failed to clean up ${file.getStorageKey()}: ${error}`);
      }
    }

    this.logger.log(`Media cleanup completed: ${cleaned} files removed`);
  }
}
