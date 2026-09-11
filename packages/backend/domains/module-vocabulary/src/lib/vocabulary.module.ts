import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
// ===== INFRASTRUCTURE MODULES =====
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';
import { InfrastructureCacheModule } from '@spark-nest-ed/infrastructure-cache';

// ===== REPOSITORY IMPLEMENTATIONS =====
import { VocabularySetRepository } from './infrastructure/repositories/vocabulary-set.repository';
import { VocabularySetItemRepository } from './infrastructure/repositories/vocabulary-set-item.repository';
import { VOCABULARY_SET_REPOSITORY } from './domain/repositories/vocabulary-set.repository.interface';
import { VOCABULARY_SET_ITEM_REPOSITORY } from './domain/repositories/vocabulary-set-item.repository.interface';
import { ENTRY_REPOSITORY } from './domain/repositories/entry.repository.interface';
import { EntryRepository } from './infrastructure/repositories/entry.repository';
import { USER_VOCABULARY_PROGRESS_REPOSITORY } from './domain/repositories/user-vocabulary-progress.repository.interface';
import { UserVocabularyProgressRepository } from './infrastructure/repositories/user-vocabulary-progress.repository';

// ===== CONTROLLERS =====
import { VocabularySetController } from './presentation/controllers/vocabulary-set.controller';

// ===== APPLICATION LAYER: Command Handlers =====
import { CreateVocabularySetHandler } from './application/commands/create-vocabulary-set';
import { UpdateVocabularySetHandler } from './application/commands/update-vocabulary-set';
import { AddWordToSetHandler } from './application/commands/add-word-to-set/add-word-to-set.handler';
import { DeleteWordFromSetHandler } from './application/commands/delete-word-from-set';
import { DeleteVocabularySetHandler } from './application/commands/delete-vocabulary-set';
import { SyncVocabularySetItemsHandler } from './application/commands/sync-vocabulary-set-items/sync-vocabulary-set-items.handler';
import { ReviewFlashcardHandler } from './application/commands/review-flashcard';

// ===== DOMAIN LAYER: Services =====
import { VocabularySetCreationService } from './domain/services/vocabulary-set-creation.service';
import { VocabularySetCreationOrchestrator } from './domain/sagas/vocabulary-set-creation-orchestrator';
import { VocabularySetCreationSaga } from './domain/sagas/vocabulary-set-creation.saga';

// ===== APPLICATION LAYER: Event Handlers =====
import { VocabularySetCreatedHandler } from './application/events/vocabulary-set-created.handler';
import { EntryCreatedHandler } from './application/events/entry-created.handler';
import { EntryAddedToSetHandler } from './application/events/entry-added-to-set.handler';

// ===== APPLICATION LAYER: Query Handlers =====
import { GetVocabularySetQueryHandler } from './application/querys/get-vocabulary-set';
import { GetWordsVocabularySetQueryHandler } from './application/querys/get-word-vocabulary-set';
import { GetCommunityVocabularySetQueryHandler } from './application/querys/get-community-vocabulary-set';
import { GetUserVocabularySetsQueryHandler } from './application/querys/get-user-vocabulary-sets';
import { GetUserFavoritesQueryHandler } from './application/querys/get-user-favorites';
import { GetEntryDetailQueryHandler } from './application/querys/get-entry-detail';
import { GetFlashcardSessionQueryHandler } from './application/querys/get-flashcard-session';

// ===== INFRASTRUCTURE LAYER: Processors =====
import { VocabularySetImportProcessor } from './infrastructure/processors/vocabulary-set-import.processor';

@Module({
  imports: [
    CqrsModule.forRoot(),
    InfrastructureDatabaseModule,
    InfrastructureCacheModule,
    // No BullModule — using BullMQService instead (1 shared connection)
  ],
  controllers: [
    VocabularySetController,
  ],
  providers: [
    CreateVocabularySetHandler,
    UpdateVocabularySetHandler,
    AddWordToSetHandler,
    DeleteWordFromSetHandler,
    DeleteVocabularySetHandler,
    SyncVocabularySetItemsHandler,
    ReviewFlashcardHandler,
    GetVocabularySetQueryHandler,
    GetWordsVocabularySetQueryHandler,
    GetCommunityVocabularySetQueryHandler,
    GetUserVocabularySetsQueryHandler,
    GetUserFavoritesQueryHandler,
    GetEntryDetailQueryHandler,
    GetFlashcardSessionQueryHandler,
    VocabularySetCreatedHandler,
    EntryCreatedHandler,
    EntryAddedToSetHandler,
    VocabularySetCreationService,
    VocabularySetCreationOrchestrator,
    VocabularySetCreationSaga,
    {
      provide: VOCABULARY_SET_REPOSITORY,
      useClass: VocabularySetRepository,
    },
    {
      provide: VOCABULARY_SET_ITEM_REPOSITORY,
      useClass: VocabularySetItemRepository,
    },
    {
      provide: ENTRY_REPOSITORY,
      useClass: EntryRepository,
    },
    {
      provide: USER_VOCABULARY_PROGRESS_REPOSITORY,
      useClass: UserVocabularyProgressRepository,
    },
    VocabularySetImportProcessor,
  ],
  exports: [
    CqrsModule,
    VOCABULARY_SET_REPOSITORY,
    VOCABULARY_SET_ITEM_REPOSITORY,
    ENTRY_REPOSITORY,
    USER_VOCABULARY_PROGRESS_REPOSITORY,
  ],
})
export class VocabularyModule {}
