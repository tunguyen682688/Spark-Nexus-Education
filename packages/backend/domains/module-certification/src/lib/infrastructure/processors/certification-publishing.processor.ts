import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';
import { CertificationCacheService } from '../cache/certification-cache.service';

@Processor('certification-publishing')
export class CertificationPublishingProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificationPublishingProcessor.name);

  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository,
    private readonly cacheService: CertificationCacheService,
  ) {
    super();
  }

  async process(job: Job<unknown>): Promise<void> {
    this.logger.log(`[Publishing] Processing job ${job.id} "${job.name}"`);

    switch (job.name) {
      case 'publish-collection':
        await this.handlePublishCollection(job as Job<{
          collectionId: string;
          userId: string;
        }>);
        break;
      default:
        this.logger.warn(`[Publishing] Unknown job name: ${job.name}`);
        break;
    }
  }

  private async handlePublishCollection(job: Job<{
    collectionId: string;
    userId: string;
  }>): Promise<void> {
    const { collectionId } = job.data;
    this.logger.log(`[Publishing] Publishing collection ${collectionId}`);

    const collection = await this.repository.findCollectionById(collectionId);
    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }

    const chapters = await this.repository.findChaptersByCollectionId(collectionId);
    const issues: string[] = [];

    for (const chapter of chapters) {
      const exams = await this.repository.findExamsByChapterId(chapter.id);
      for (const exam of exams) {
        const questions = await this.repository.findExamQuestionsByExamId(exam.id);
        if (questions.length === 0) {
          issues.push(`Exam "${exam.getTitle()}" in chapter "${chapter.getTitle()}" has no questions`);
        }
      }
    }

    if (issues.length > 0) {
      this.logger.warn(`[Publishing] Collection ${collectionId} has issues: ${issues.join('; ')}`);
      throw new Error(`Cannot publish: ${issues.join('; ')}`);
    }

    collection.update({ publishStatus: 'published' });
    await this.repository.saveCollection(collection);

    await this.cacheService.delete(`certification:collections:${collectionId}`);
    await this.cacheService.delete(`certification:editor:${collectionId}`);

    await job.updateProgress(100);
    this.logger.log(`[Publishing] Collection ${collectionId} published successfully`);
  }
}
