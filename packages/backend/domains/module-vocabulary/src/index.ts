export * from './lib/vocabulary.module';

// ===== DOMAIN REPOSITORIES & ENTITIES =====
export * from './lib/domain/repositories/vocabulary-set.repository.interface';
export * from './lib/domain/repositories/vocabulary-set-item.repository.interface';
export * from './lib/domain/repositories/entry.repository.interface';
export * from './lib/domain/repositories/user-vocabulary-progress.repository.interface';

export * from './lib/domain/entities/vocabulary-set-item.entity';
export * from './lib/domain/entities/entry.entity';
export * from './lib/domain/entities/user-vocabulary-progress.entity';

export * from './lib/domain/aggregates/vocabulary-set.aggregate';

// ===== DOMAIN SERVICES =====
export * from './lib/domain/services/vocabulary-set-creation.service';

// ===== APPLICATION DTOS & QUERIES =====
export * from './lib/application/dtos/reponse-word.dto';
export * from './lib/application/dtos/flashcard.dto';
export * from './lib/application/dtos/create-vocabulary-set.dto';
export * from './lib/application/dtos/update-vocabulary-set.dto';

export * from './lib/application/querys/get-vocabulary-set';
export * from './lib/application/querys/get-word-vocabulary-set';
export * from './lib/application/querys/get-community-vocabulary-set';
export * from './lib/application/querys/get-user-vocabulary-sets';
export * from './lib/application/querys/get-user-favorites';
export * from './lib/application/querys/get-entry-detail';
export * from './lib/application/querys/get-flashcard-session';

// ===== APPLICATION COMMANDS =====
export * from './lib/application/commands/create-vocabulary-set';
export * from './lib/application/commands/update-vocabulary-set';
export * from './lib/application/commands/add-word-to-set/add-word-to-set.command';
export * from './lib/application/commands/delete-word-from-set';
export * from './lib/application/commands/delete-vocabulary-set';
export * from './lib/application/commands/sync-vocabulary-set-items/sync-vocabulary-set-items.command';
export * from './lib/application/commands/review-flashcard';
