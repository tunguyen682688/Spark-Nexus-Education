import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetExamInitializationStatusQuery, InitProgressData } from './get-exam-initialization-status.query';
import { CertificationCacheService } from '../../../infrastructure/cache/certification-cache.service';

const PROGRESS_KEY_PREFIX = 'certification:init-progress:';

@QueryHandler(GetExamInitializationStatusQuery)
export class GetExamInitializationStatusHandler implements IQueryHandler<GetExamInitializationStatusQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository,
    private readonly cacheService: CertificationCacheService,
  ) {}

  async execute(query: GetExamInitializationStatusQuery): Promise<{
    id: string;
    initializationStatus: string;
    progress: InitProgressData | null;
  }> {
    const exam = await this.repository.findExamById(query.examId);
    if (!exam) {
      throw new NotFoundException(`Exam ${query.examId} not found`);
    }

    // Read real-time progress from Redis
    const progress = await this.cacheService.get<InitProgressData>(
      `${PROGRESS_KEY_PREFIX}${query.examId}`
    );

    return {
      id: exam.id,
      initializationStatus: exam.getInitializationStatus(),
      progress: progress ?? null,
    };
  }
}
