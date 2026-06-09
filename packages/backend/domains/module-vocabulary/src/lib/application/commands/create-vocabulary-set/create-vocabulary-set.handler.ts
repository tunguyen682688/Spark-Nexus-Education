import {
  CommandHandler,
  ICommandHandler,
  EventBus,
  IEvent,
} from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Inject, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { CreateVocabularySetCommand } from './create-vocabulary-set.command';
import { VocabularySetAggregate } from '../../../domain/aggregates/vocabulary-set.aggregate';
import { VocabularySetEntity } from '../../../domain/entities/vocabulary-set.entity';
import { LanguageVO } from '../../../domain/value-objects/language.vo';
import { SetTypeVO } from '../../../domain/value-objects/set-type.vo';
import { DifficultyVO } from '../../../domain/value-objects/difficulty.vo';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';
import { VOCABULARY_SET_REPOSITORY } from '../../../domain/repositories/vocabulary-set.repository.interface';
import { VocabularySetResponseDto } from '../../dtos/reponse-vocabulary-set.dto';
import { VocabularySetCreationOrchestrator } from '../../../domain/sagas/vocabulary-set-creation-orchestrator';
import { VocabularySetCreatedEvent } from '../../../domain/events/vocabulary-set-created.event';

/**
 * Performance Configuration
 */
const PERFORMANCE_CONFIG = {
  // Reduced threshold due to Prisma Accelerate 15s transaction limit
  // With 12s timeout, we can safely process ~30-40 words synchronously
  SYNC_THRESHOLD: 30, // Switch to async if > 30 words
  BATCH_SIZE: 100,
} as const;

/**
 * Handler: CreateVocabularySetHandler
 *
 * Refactored to use:
 * - Domain Service Layer (VocabularySetCreationService)
 * - Saga Pattern (VocabularySetCreationSaga)
 * - Repository Layer (all Prisma queries in repositories)
 * - Background Jobs (BullMQ) for large batches
 *
 * Architecture:
 * Handler → Domain Service → Saga → Repositories → Database
 *
 * Business Logic:
 * 1. Existing words (published) → Attach directly to vocabulary set
 * 2. New words → Create as draft, needs approval before publishing to community
 */
@CommandHandler(CreateVocabularySetCommand)
export class CreateVocabularySetHandler
  implements
    ICommandHandler<CreateVocabularySetCommand, VocabularySetResponseDto>
{
  private readonly logger = new Logger(CreateVocabularySetHandler.name);

  constructor(
    @Inject(VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    private readonly eventBus: EventBus,
    @InjectQueue('vocabulary-set-import')
    private readonly importQueue: Queue,
    private readonly orchestrator: VocabularySetCreationOrchestrator
  ) {}

  async execute(
    command: CreateVocabularySetCommand
  ): Promise<VocabularySetResponseDto> {
    const wordCount = command.initialWords?.length || 0;
    this.logger.log(
      `[Create Set] Received request to create set "${command.title}" by user ${command.userId}. Initial words count: ${wordCount}`
    );

    // Step 1: Convert Command values to Value Objects
    const languageVO = LanguageVO.create(command.language);
    const typeVO = SetTypeVO.create(command.type);
    const difficultyVO = command.difficulty
      ? DifficultyVO.create(command.difficulty)
      : null;

    // Step 2: Generate unique ID for vocabulary set
    const setId = randomUUID();

    // Step 3: Create VocabularySetAggregate
    const vocabularySetAggregate = VocabularySetAggregate.create(
      setId,
      command.title,
      command.description || null,
      languageVO,
      typeVO,
      command.userId,
      difficultyVO,
      command.tags,
      command.coverImageUrl || null
    );

    // Step 4: Determine processing strategy
    if (wordCount === 0) {
      // Empty set - simple case
      return await this.createEmptySet(vocabularySetAggregate);
    } else if (wordCount <= PERFORMANCE_CONFIG.SYNC_THRESHOLD) {
      // Small batch - process synchronously using Saga
      if (!command.initialWords) {
        throw new Error('Initial words are required');
      }
      return await this.createSetWithWordsSync(
        vocabularySetAggregate,
        command.initialWords,
        languageVO.getValue()
      );
    } else {
      // Large batch - use background job
      if (!command.initialWords) {
        throw new Error('Initial words are required');
      }
      return await this.createSetWithWordsAsync(
        vocabularySetAggregate,
        command.initialWords,
        languageVO.getValue(),
        command.userId
      );
    }
  }

  /**
   * Create empty vocabulary set
   */
  private async createEmptySet(
    aggregate: VocabularySetAggregate
  ): Promise<VocabularySetResponseDto> {
    const set = await this.vocabularySetRepository.create(
      aggregate.getVocabularySet()
    );

    // Publish events asynchronously
    this.publishEventsAsync(aggregate.getVocabularySet());

    return this.toResponseDto(set);
  }

  /**
   * Create set with words synchronously using Saga
   */
  private async createSetWithWordsSync(
    aggregate: VocabularySetAggregate,
    initialWords: NonNullable<CreateVocabularySetCommand['initialWords']>,
    language: string
  ): Promise<VocabularySetResponseDto> {
    // Execute Orchestrator for atomic transaction
    // Orchestrator will handle:
    // - Processing words (find existing vs new)
    // - Creating new entries (if needed)
    // - Adding words to aggregate
    // - Persisting everything in transaction
    const result = await this.orchestrator.execute(
      aggregate,
      initialWords,
      language
    );

    // Publish domain events after transaction commits
    this.publishEventsFromOrchestrator(
      result.domainEvents,
      result.itemIds,
      result.vocabularySet
    );

    // Clear events from aggregate after collecting (they're already published)
    aggregate.clearDomainEvents();

    this.logger.log(
      `Created vocabulary set ${result.vocabularySet.getId()} with ${
        initialWords.length
      } words. ` +
        `New entries: ${result.createdEntryIds.length}, Existing entries: ${
          initialWords.length - result.createdEntryIds.length
        }`
    );

    return this.toResponseDto(result.vocabularySet);
  }

  /**
   * Create set with words asynchronously (background job)
   */
  private async createSetWithWordsAsync(
    aggregate: VocabularySetAggregate,
    initialWords: NonNullable<CreateVocabularySetCommand['initialWords']>,
    language: string,
    userId: string
  ): Promise<VocabularySetResponseDto> {
    // Step 1: Create vocabulary set with "pending" status
    const set = aggregate.getVocabularySet();
    set.setImportStatus('pending');
    set.setImportProgress({
      total: initialWords.length,
      processed: 0,
      failed: 0,
    });

    const persistedSet = await this.vocabularySetRepository.create(set);

    // Step 2: Queue background job
    await this.importQueue.add(
      'import-vocabulary-words',
      {
        vocabularySetId: persistedSet.getId(),
        words: initialWords,
        language: language,
        userId: userId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 86400,
        },
      }
    );

    this.logger.log(
      `Queued background job for vocabulary set ${persistedSet.getId()} with ${
        initialWords.length
      } words`
    );

    // Step 3: Publish creation event
    this.publishEventsAsync(set);

    return this.toResponseDto(persistedSet);
  }

  /**
   * Publish domain events asynchronously (non-blocking)
   */
  private publishEventsAsync(set: VocabularySetEntity): void {
    const events = set.getDomainEvents();
    if (events.length === 0) {
      return;
    }

    setImmediate(async () => {
      try {
        for (const event of events) {
          await this.eventBus.publish(event);
        }
        set.clearDomainEvents();
      } catch (error) {
        this.logger.error('Failed to publish domain events', error);
      }
    });
  }

  /**
   * Publish domain events from orchestrator result
   */
  private publishEventsFromOrchestrator(
    events: readonly IEvent[],
    itemIds: string[],
    vocabularySet: VocabularySetEntity
  ): void {
    if (events.length === 0 && itemIds.length === 0) {
      return;
    }

    setImmediate(async () => {
      try {
        // Publish events from aggregate
        // DomainEvent extends IEvent, so this is safe
        for (const event of events) {
          await this.eventBus.publish(event);
        }

        // Publish additional events if needed
        // EntryAddedToSetEvent should already be in domain events from aggregate
        // But we can publish VocabularySetCreatedEvent if not already published
        const hasVocabularySetCreated = events.some(
          (e): e is VocabularySetCreatedEvent =>
            e instanceof VocabularySetCreatedEvent
        );

        if (!hasVocabularySetCreated) {
          await this.eventBus.publish(
            new VocabularySetCreatedEvent(
              vocabularySet.getId(),
              vocabularySet.getUserId(),
              vocabularySet.getTitle(),
              vocabularySet.getLanguage().getValue(),
              vocabularySet.getType().getValue()
            )
          );
        }

        // EntryAddedToSetEvent should already be published by aggregate
        // All events from aggregate are now published
      } catch (error) {
        this.logger.error(
          'Failed to publish domain events from orchestrator',
          error
        );
      }
    });
  }

  /**
   * Convert VocabularySetEntity to ResponseDto
   */
  private toResponseDto(entity: VocabularySetEntity): VocabularySetResponseDto {
    return {
      id: entity.getId(),
      title: entity.getTitle(),
      description: entity.getDescription(),
      language: entity.getLanguage().getValue(),
      type: entity.getType().getValue(),
      difficulty: entity.getDifficulty()?.getValue() || null,
      isPublic: entity.getIsPublic(),
      isActive: entity.getIsActive(),
      tags: entity.getTags(),
      coverImage: entity.getCoverImage(),
      userId: entity.getUserId(),
      entryCount: entity.getEntryCount(),
      favoriteCount: entity.getFavoriteCount(),
      studyCount: entity.getStudyCount(),
      importStatus: entity.getImportStatus(),
      importProgress: entity.getImportProgress(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
