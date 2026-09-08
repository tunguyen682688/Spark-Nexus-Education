import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';

// Controllers
import { CertificationController } from './presentation/controllers/certification.controller';

// Query Handlers
import {
  GetCertificationDashboardQueryHandler,
  GetCreatorDashboardQueryHandler,
  GetCollectionEditorQueryHandler,
  GetExamBuilderQueryHandler,
  GetFeaturedCollectionsQueryHandler,
  GetTrendingCollectionsQueryHandler,
  GetOfficialCollectionsQueryHandler,
  GetCommunityCollectionsQueryHandler,
  GetStudyPlanQueryHandler,
  GetTopContributorsQueryHandler,
  GetCollectionQueryHandler,
  GetCollectionItemsQueryHandler,
  GetExamQueryHandler,
  GetExamInitializationStatusHandler,
  GetExamSessionQueryHandler,
  GetExamResultQueryHandler,
  GetQuestionBuilderQueryHandler,
  GetQuestionHistoryQueryHandler,
  GetFavoritesQueryHandler,
  GetBookmarksQueryHandler,
  GetDownloadsQueryHandler,
  GetPurchasedCollectionsQueryHandler,
  GetCompletedCollectionsQueryHandler,
  GetPracticeHistoryQueryHandler,
  GetSavedCollectionsQueryHandler,
  GetCollectionReviewsQueryHandler,
  GetCollectionDiscussionsQueryHandler,
  GetSectionQuestionsQueryHandler,
  GetClonedCollectionsQueryHandler,
  GetMyCollectionsQueryHandler,
  GetCollectionActivitiesQueryHandler,
  GetInProgressSessionsQueryHandler,
} from './application/queries';

// Command Handlers
import {
  StartExamSessionHandler,
  SaveSessionAnswerHandler,
  RecordSessionViolationHandler,
  SubmitExamSessionHandler,
  CreateCollectionCommandHandler,
  UpdateCollectionCommandHandler,
  DeleteCollectionCommandHandler,
  CreateExamCommandHandler,
  UpdateExamCommandHandler,
  DeleteExamCommandHandler,
  SaveCollectionCommandHandler,
  CloneCollectionCommandHandler,
  SaveQuestionHandler,
  DeleteQuestionHandler,
  AddFavoriteCommandHandler,
  RemoveFavoriteCommandHandler,
  AddBookmarkCommandHandler,
  RemoveBookmarkCommandHandler,
  DeleteDownloadCommandHandler,
  ClearDownloadsCommandHandler,
  SaveReportCommandHandler,
  AddCollectionReviewCommandHandler,
  AddCollectionDiscussionCommandHandler,
  SyncChaptersCommandHandler,
  SaveExamSectionsCommandHandler,
  SaveExamContentHandler,
  PatchExamContentHandler,
  InitializeExamQuestionsHandler,
  LinkQuestionToExamCommandHandler,
  UnlinkQuestionFromExamCommandHandler,
} from './application/commands';

// Repository Implementations
import { CERTIFICATION_REPOSITORY } from './domain/repositories/certification.repository.interface';
import { CertificationRepository } from './infrastructure/repositories/certification.repository';

// Domain Services
import { ExamSessionDomainService } from './domain/services/exam-session-domain.service';

// Cache Services
import { CertificationCacheService } from './infrastructure/cache/certification-cache.service';

// Domain Saga & Infrastructure Processors
import { CertificationSaga } from './domain/sagas/certification.saga';
import { CertificationInitProcessor } from './infrastructure/processors/certification-init.processor';
import { CertificationScoringProcessor } from './infrastructure/processors/certification-scoring.processor';
import { CertificationAnalyticsProcessor } from './infrastructure/processors/certification-analytics.processor';
import { CertificationPublishingProcessor } from './infrastructure/processors/certification-publishing.processor';
import { ExamStrategyRegistry } from './domain/exam-strategies/exam-strategy.registry';
import { ToeicStrategy } from './domain/exam-strategies/toeic/toeic.strategy';
import { IeltsStrategy } from './domain/exam-strategies/ielts/ielts.strategy';
import { VstepStrategy } from './domain/exam-strategies/vstep/vstep.strategy';
import { CambridgeStrategy } from './domain/exam-strategies/cambridge/cambridge.strategy';

const QueryHandlers = [
  GetCertificationDashboardQueryHandler,
  GetCreatorDashboardQueryHandler,
  GetCollectionEditorQueryHandler,
  GetExamBuilderQueryHandler,
  GetFeaturedCollectionsQueryHandler,
  GetTrendingCollectionsQueryHandler,
  GetOfficialCollectionsQueryHandler,
  GetCommunityCollectionsQueryHandler,
  GetStudyPlanQueryHandler,
  GetTopContributorsQueryHandler,
  GetCollectionQueryHandler,
  GetCollectionItemsQueryHandler,
  GetExamQueryHandler,
  GetExamInitializationStatusHandler,
  GetExamSessionQueryHandler,
  GetExamResultQueryHandler,
  GetQuestionBuilderQueryHandler,
  GetQuestionHistoryQueryHandler,
  GetFavoritesQueryHandler,
  GetBookmarksQueryHandler,
  GetDownloadsQueryHandler,
  GetPurchasedCollectionsQueryHandler,
  GetCompletedCollectionsQueryHandler,
  GetPracticeHistoryQueryHandler,
  GetSavedCollectionsQueryHandler,
  GetCollectionReviewsQueryHandler,
  GetCollectionDiscussionsQueryHandler,
  GetSectionQuestionsQueryHandler,
  GetClonedCollectionsQueryHandler,
  GetMyCollectionsQueryHandler,
  GetCollectionActivitiesQueryHandler,
  GetInProgressSessionsQueryHandler,
];

const CommandHandlers = [
  StartExamSessionHandler,
  SaveSessionAnswerHandler,
  RecordSessionViolationHandler,
  SubmitExamSessionHandler,
  CreateCollectionCommandHandler,
  UpdateCollectionCommandHandler,
  DeleteCollectionCommandHandler,
  CreateExamCommandHandler,
  UpdateExamCommandHandler,
  DeleteExamCommandHandler,
  SaveCollectionCommandHandler,
  CloneCollectionCommandHandler,
  SaveQuestionHandler,
  DeleteQuestionHandler,
  AddFavoriteCommandHandler,
  RemoveFavoriteCommandHandler,
  AddBookmarkCommandHandler,
  RemoveBookmarkCommandHandler,
  DeleteDownloadCommandHandler,
  ClearDownloadsCommandHandler,
  SaveReportCommandHandler,
  AddCollectionReviewCommandHandler,
  AddCollectionDiscussionCommandHandler,
  SyncChaptersCommandHandler,
  SaveExamSectionsCommandHandler,
  SaveExamContentHandler,
  PatchExamContentHandler,
  InitializeExamQuestionsHandler,
  LinkQuestionToExamCommandHandler,
  UnlinkQuestionFromExamCommandHandler,
];

/**
 * Queue configurations with production-grade settings:
 * - concurrency: parallel workers per queue
 * - rateLimit: max jobs per duration to prevent DB overload
 * - defaultJobOptions: shared retry/cleanup defaults
 */
@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    InfrastructureDatabaseModule,

    // Queue 1: Heavy question creation (200 questions, 30-60s)
    BullModule.registerQueue({
      name: 'certification-init',
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    }),

    // Queue 2: Score calculation (grading, 5-15s)
    BullModule.registerQueue({
      name: 'certification-scoring',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    }),

    // Queue 3: Analytics (lightweight, logging, stats)
    BullModule.registerQueue({
      name: 'certification-analytics',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { age: 1800 },
        removeOnFail: { age: 86400 },
      },
    }),

    // Queue 4: Publishing (validation, clone, publish)
    BullModule.registerQueue({
      name: 'certification-publishing',
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
      },
    }),
  ],
  controllers: [CertificationController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    ExamSessionDomainService,
    CertificationCacheService,
    CertificationSaga,
    CertificationInitProcessor,
    CertificationScoringProcessor,
    CertificationAnalyticsProcessor,
    CertificationPublishingProcessor,
    {
      provide: CERTIFICATION_REPOSITORY,
      useClass: CertificationRepository,
    },
    {
      provide: ExamStrategyRegistry,
      useFactory: () => {
        const registry = new ExamStrategyRegistry();
        registry.register(new ToeicStrategy());
        registry.register(new IeltsStrategy());
        registry.register(new VstepStrategy());
        registry.register(new CambridgeStrategy());
        return registry;
      },
    },
  ],
  exports: [
    ExamSessionDomainService,
    CertificationCacheService,
    CERTIFICATION_REPOSITORY,
  ],
})
export class CertificationModule {}
