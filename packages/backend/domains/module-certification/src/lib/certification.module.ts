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
} from './application/commands';

// Repository Implementations
import { CERTIFICATION_REPOSITORY } from './domain/repositories/certification.repository.interface';
import { CertificationRepository } from './infrastructure/repositories/certification.repository';

// Domain Services
import { ExamSessionDomainService } from './domain/services/exam-session-domain.service';

// Cache Services
import { CertificationCacheService } from './infrastructure/cache/certification-cache.service';

// Domain Saga & Infrastructure Processor
import { CertificationSaga } from './domain/sagas/certification.saga';
import { CertificationProcessor } from './infrastructure/processors/certification.processor';

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
];

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: 'certification-tasks',
    }),
    ConfigModule,
    InfrastructureDatabaseModule,
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
  ],
  exports: [
    ExamSessionDomainService,
    CertificationCacheService,
    CERTIFICATION_REPOSITORY,
  ],
})
export class CertificationModule {}
