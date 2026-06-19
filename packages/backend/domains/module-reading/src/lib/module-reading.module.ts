import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';

// Controller
import { ReadingController } from './presentation/controllers/reading.controller';

// Query Handlers
import { GetReadingDashboardQueryHandler } from './application/querys/get-reading-dashboard/get-reading-dashboard.handler';
import { GetArticlesQueryHandler } from './application/querys/get-articles/get-articles.handler';
import { GetArticleQueryHandler } from './application/querys/get-article/get-article.handler';
import { GetArticleQuizQueryHandler } from './application/querys/get-article-quiz/get-article-quiz.handler';
import { TranslateWordInContextQueryHandler } from './application/querys/translate-word-in-context/translate-word-in-context.handler';
import { GetCommunityArticlesHandler } from './application/querys/get-community-articles/get-community-articles.handler';
import { GetMyArticlesHandler } from './application/querys/get-my-articles/get-my-articles.handler';
import { TranslateParagraphQueryHandler } from './application/querys/translate-paragraph/translate-paragraph.handler';

// Command Handlers
import { UpdateReadingProgressCommandHandler } from './application/commands/update-reading-progress/update-reading-progress.handler';
import { SubmitArticleQuizCommandHandler } from './application/commands/submit-article-quiz/submit-article-quiz.handler';
import { CreateCommunityArticleHandler } from './application/commands/create-community-article/create-community-article.handler';
import { InteractArticleHandler } from './application/commands/interact-article/interact-article.handler';
import { AddArticleCommentHandler } from './application/commands/add-article-comment/add-article-comment.handler';
import { CreateStudioArticleHandler } from './application/commands/create-studio-article/create-studio-article.handler';
import { UpdateStudioArticleHandler } from './application/commands/update-studio-article/update-studio-article.handler';
import { DeleteStudioArticleHandler } from './application/commands/delete-studio-article/delete-studio-article.handler';

// Application Event Handlers
import { ReadingProgressUpdatedHandler } from './application/events/reading-progress-updated.handler';
import { ReadingQuizSubmittedHandler } from './application/events/reading-quiz-submitted.handler';

// Services & Repository Interfaces
import { ReadingQuizService } from './infrastructure/services/reading-quiz.service';
import { READING_QUIZ_SERVICE } from './domain/services/reading-quiz.service.interface';
import { READING_REPOSITORY } from './domain/repositories/reading.repository.interface';
import { ReadingRepository } from './infrastructure/repositories/reading.repository';
import { TranslationService } from './infrastructure/services/translation.service';
import { TRANSLATION_SERVICE } from './domain/services/translation.service.interface';

// Domain Saga & Infrastructure Processor
import { ReadingSaga } from './domain/sagas/reading.saga';
import { ReadingProcessor } from './infrastructure/processors/reading.processor';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: 'reading-tasks',
    }),
    InfrastructureDatabaseModule,
  ],
  controllers: [
    ReadingController,
  ],
  providers: [
    // ===== APPLICATION LAYER: Query Handlers =====
    GetReadingDashboardQueryHandler,
    GetArticlesQueryHandler,
    GetArticleQueryHandler,
    GetArticleQuizQueryHandler,
    TranslateWordInContextQueryHandler,
    GetCommunityArticlesHandler,
    GetMyArticlesHandler,
    TranslateParagraphQueryHandler,

    // ===== APPLICATION LAYER: Command Handlers =====
    UpdateReadingProgressCommandHandler,
    SubmitArticleQuizCommandHandler,
    CreateCommunityArticleHandler,
    InteractArticleHandler,
    AddArticleCommentHandler,
    CreateStudioArticleHandler,
    UpdateStudioArticleHandler,
    DeleteStudioArticleHandler,

    // ===== APPLICATION LAYER: Event Handlers =====
    ReadingProgressUpdatedHandler,
    ReadingQuizSubmittedHandler,

    // ===== INFRASTRUCTURE LAYER: Service Implementations =====
    {
      provide: READING_QUIZ_SERVICE,
      useClass: ReadingQuizService,
    },
    {
      provide: TRANSLATION_SERVICE,
      useClass: TranslationService,
    },

    // ===== INFRASTRUCTURE LAYER: Repository Implementation =====
    {
      provide: READING_REPOSITORY,
      useClass: ReadingRepository,
    },

    // ===== DOMAIN LAYER: Saga =====
    ReadingSaga,

    // ===== INFRASTRUCTURE LAYER: Background Job Processor =====
    ReadingProcessor,
  ],
  exports: [
    CqrsModule,
    READING_REPOSITORY,
    READING_QUIZ_SERVICE,
    TRANSLATION_SERVICE,
  ],
})
export class ReadingModule {}

