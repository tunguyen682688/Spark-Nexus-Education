import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';
import { InfrastructureCacheModule } from '@spark-nest-ed/infrastructure-cache';

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

// Saga & Processor
import { CertificationSaga } from './domain/sagas/certification.saga';
import { CertificationProcessor } from './infrastructure/processors/certification.processor';
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

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    InfrastructureDatabaseModule,
    InfrastructureCacheModule,
    // No BullModule — using BullMQService instead (1 shared connection)
  ],
  controllers: [CertificationController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    ExamSessionDomainService,
    CertificationCacheService,
    CertificationSaga,
    CertificationProcessor,
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
