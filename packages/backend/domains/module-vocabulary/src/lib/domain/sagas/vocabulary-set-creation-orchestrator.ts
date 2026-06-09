import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEvent } from '@nestjs/cqrs';
import { VocabularySetAggregate } from '../aggregates/vocabulary-set.aggregate';
import { VocabularySetEntity } from '../entities/vocabulary-set.entity';
import { WordProcessingResult } from '../services/vocabulary-set-creation.service';
import * as vocabularySetRepositoryInterface from '../repositories/vocabulary-set.repository.interface';
import * as vocabularySetItemRepositoryInterface from '../repositories/vocabulary-set-item.repository.interface';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { EntryEntity } from '../entities/entry.entity';
import { randomUUID } from 'crypto';

/**
 * VocabularySetCreationOrchestrator
 *
 * Transaction orchestrator cho việc tạo vocabulary set với words
 * Quản lý database transaction và workflow orchestration
 *
 * Note: Đây không phải là NestJS CQRS Saga, mà là transaction orchestrator
 * NestJS CQRS Saga được implement riêng trong vocabulary-set-creation.saga.ts
 */
@Injectable()
export class VocabularySetCreationOrchestrator {
  private readonly logger = new Logger(VocabularySetCreationOrchestrator.name);

  constructor(
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    @Inject(vocabularySetItemRepositoryInterface.VOCABULARY_SET_ITEM_REPOSITORY)
    private readonly vocabularySetItemRepository: vocabularySetItemRepositoryInterface.IVocabularySetItemRepository,
    // private readonly creationService: VocabularySetCreationService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Execute orchestration for creating vocabulary set with words
   * Uses database transaction for atomicity
   */
  async execute(
    aggregate: VocabularySetAggregate,
    words: Array<{
      word: string;
      definition?: string;
      example?: string;
      notes?: string;
      partOfSpeech?: string;
    }>,
    language: string
  ): Promise<{
    vocabularySet: VocabularySetEntity;
    processingResults: Map<string, WordProcessingResult>;
    createdEntryIds: string[];
    domainEvents: readonly IEvent[];
    itemIds: string[];
  }> {
    return await this.prisma.$transaction(
      async (tx) => {
        const sagaState = {
          vocabularySet: null as VocabularySetEntity | null,
          processingResults: new Map<string, WordProcessingResult>(),
          createdEntryIds: [] as string[],
          createdItemIds: [] as string[],
        };

        try {
          // Step 1: Create or use existing Vocabulary Set
          const setEntity = aggregate.getVocabularySet();
          const txClient = tx as unknown as {
            vocabularySet: {
              findUnique: (args: { where: { id: string } }) => Promise<unknown>;
            };
          };
          const existingSet = (await txClient.vocabularySet.findUnique({
            where: { id: setEntity.getId() },
          })) as {
            id: string;
            title: string;
            description: string | null;
            language: string;
            type: string;
            difficulty: string | null;
            isPublic: boolean;
            isActive: boolean;
            tags: string[];
            coverImage: string | null;
            userId: string;
            entryCount: number;
            favoriteCount: number;
            studyCount: number;
            importStatus?: string | null;
            importProgress?: unknown;
            createdAt: Date;
            updatedAt: Date;
            deleted: boolean;
            version: bigint | number;
          } | null;

          if (existingSet) {
            // Set already exists (background job case) - use existing
            this.logger.log(
              'Orchestrator Step 1: Using existing vocabulary set'
            );
            sagaState.vocabularySet = (
              this.vocabularySetRepository as unknown as {
                toDomain: (data: unknown) => VocabularySetEntity;
              }
            ).toDomain(existingSet);
          } else {
            // Create new set
            this.logger.log('Orchestrator Step 1: Creating vocabulary set');
            sagaState.vocabularySet =
              await this.vocabularySetRepository.createInTransaction(
                tx,
                setEntity
              );

            // VocabularySetCreatedEvent is already raised in VocabularySetEntity.fromPersistence
            // No need to raise it again here
          }

          if (words.length === 0) {
            // Empty set - return early with events
            const domainEvents = aggregate.getDomainEvents();
            return {
              vocabularySet: sagaState.vocabularySet,
              processingResults: sagaState.processingResults,
              createdEntryIds: sagaState.createdEntryIds,
              domainEvents,
              itemIds: [],
            };
          }

          // Step 2: Process Words (find existing vs new) - INSIDE transaction
          // Optimized: Run inside transaction to reduce round-trips
          // For small batches (≤30 words), this is fast enough
          this.logger.log(
            `Orchestrator Step 2: Processing ${words.length} words`
          );
          sagaState.processingResults = await this.processWordsInTransaction(
            tx,
            words,
            language
          );

          // Step 3: Create New Entries
          const wordsToCreate = Array.from(sagaState.processingResults.values())
            .filter((r) => r.isNew)
            .map((r) => ({
              word: r.word,
              definition: r.definition || undefined,
              example: r.example || undefined,
            }));

          let createdEntries = new Map<string, string>();
          if (wordsToCreate.length > 0) {
            this.logger.log(
              `Orchestrator Step 3: Creating ${wordsToCreate.length} new entries`
            );
            createdEntries = await this.createEntriesInTransaction(
              tx,
              wordsToCreate,
              language
            );

            // Update processing results with created entry IDs
            for (const [wordLower, entryId] of createdEntries) {
              const result = sagaState.processingResults.get(wordLower);
              if (result) {
                result.entryId = entryId;
              }
              sagaState.createdEntryIds.push(entryId);
            }
          }

          // Step 4: Add words to aggregate and create items
          this.logger.log(
            'Orchestrator Step 4: Adding items to vocabulary set'
          );

          // Build entry ID map (both new and existing)
          const entryIdMap = new Map<string, string>();

          // Add newly created entries
          for (const [wordLower, entryId] of createdEntries) {
            entryIdMap.set(wordLower, entryId);
          }

          // Add existing entries from processing results
          for (const [wordLower, result] of sagaState.processingResults) {
            if (!result.isNew && result.entryId) {
              entryIdMap.set(wordLower, result.entryId);
            }
          }

          // Add words to aggregate - create EntryEntities and add to aggregate
          const entriesToAdd: Array<{
            itemId: string;
            entry: EntryEntity;
            position?: number | null;
            notes?: string | null;
            definition?: string | null;
            example?: string | null;
          }> = [];

          for (let i = 0; i < words.length; i++) {
            const wordInput = words[i];
            const word = wordInput.word.trim();
            const wordLower = word.toLowerCase();
            const processingResult = sagaState.processingResults.get(wordLower);

            if (!processingResult) {
              this.logger.warn(`No processing result for word: ${word}`);
              continue;
            }

            const entryId =
              processingResult.entryId || entryIdMap.get(wordLower);
            if (!entryId) {
              this.logger.warn(`No entry ID for word: ${word}`);
              continue;
            }

            // Create EntryEntity
            // Use partOfSpeech from wordInput if provided, otherwise use from existing entry if available
            const partOfSpeech = wordInput.partOfSpeech || processingResult.partOfSpeech || null;
            
            const entryEntity = EntryEntity.fromPersistence({
              id: entryId,
              word: word,
              language: language,
              pronunciation: null,
              partOfSpeech: partOfSpeech,
              frequency: 0,
              isDraft: processingResult.isNew, // New entries are drafts
              isPublished:
                !processingResult.isNew && !processingResult.needsApproval,
              notes: null,
              sourceUrl: null,
              tags: [],
              audioUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              deleted: false,
              version: 1,
            });

            // Build item payload including per-set custom fields
            entriesToAdd.push({
              itemId: randomUUID(),
              entry: entryEntity,
              position: i + 1,
              notes: wordInput.notes || null,
              // Store user-provided definition/example as custom fields on the set item
              definition: wordInput.definition ?? null,
              example: wordInput.example ?? null,
            });
          }

          if (entriesToAdd.length > 0) {
            aggregate.addEntries(entriesToAdd);
          }

          const items = aggregate.getItems();
          if (items.length > 0) {
            // Convert readonly array to mutable array
            const mutableItems = Array.from(items);
            await this.vocabularySetItemRepository.createManyInTransaction(
              tx,
              mutableItems
            );
            sagaState.createdItemIds = mutableItems.map((item) => item.getId());
          }

          // Step 5: Update Entry Count
          await this.vocabularySetRepository.updateEntryCountInTransaction(
            tx,
            sagaState.vocabularySet.getId(),
            items.length
          );

          // Step 6: Collect domain events from aggregate
          // Events will be published after transaction commits
          const domainEvents = aggregate.getDomainEvents();
          const itemIds =
            items.length > 0
              ? Array.from(items).map((item) => item.getId())
              : [];

          this.logger.log('Orchestrator completed successfully');

          // Return result with events to be published by handler
          return {
            vocabularySet: sagaState.vocabularySet,
            processingResults: sagaState.processingResults,
            createdEntryIds: sagaState.createdEntryIds,
            domainEvents,
            itemIds,
          };
        } catch (error) {
          this.logger.error('Orchestrator failed, rolling back', error);
          // Transaction will automatically rollback
          throw error;
        }
      },
      {
        // Prisma Accelerate limit: 15 seconds for interactive transactions
        // Using 12 seconds to provide safety margin
        timeout: 12000,
        isolationLevel: 'ReadCommitted',
      }
    );
  }

  /**
   * Process words inside transaction to reduce round-trips
   * Optimized version of creationService.processWords
   */
  private async processWordsInTransaction(
    tx: unknown,
    words: Array<{
      word: string;
      definition?: string;
      example?: string;
      notes?: string;
    }>,
    language: string
  ): Promise<Map<string, WordProcessingResult>> {
    const result = new Map<string, WordProcessingResult>();

    if (words.length === 0) {
      return result;
    }

    const txClient = tx as {
      entry: {
        findMany: (args: {
          where: {
            language: string;
            OR: Array<{ word: { equals: string; mode: 'insensitive' } }>;
          };
          select: {
            id: true;
            word: true;
            language: true;
            senses: {
              select: { definition: true };
              take: number;
              orderBy: { createdAt: 'asc' };
            };
            examples: {
              select: { exampleText: true };
              take: number;
              orderBy: { createdAt: 'asc' };
            };
          };
        }) => Promise<
          Array<{
            id: string;
            word: string;
            language: string;
            senses: Array<{ definition: string }>;
            examples: Array<{ exampleText: string }>;
          }>
        >;
      };
    };

    // Batch find existing entries in one query
    const wordList = words.map((w) => w.word.trim().toLowerCase());
    const sanitizedWords = Array.from(
      new Set(
        wordList.filter((word): word is string => !!word && word.length > 0)
      )
    );

    let existingEntries: Array<{
      id: string;
      word: string;
      language: string;
      definition: string | null;
      example: string | null;
    }> = [];

    if (sanitizedWords.length > 0) {
      const entries = await txClient.entry.findMany({
        where: {
          language,
          OR: sanitizedWords.map((word) => ({
            word: { equals: word, mode: 'insensitive' },
          })),
        },
        select: {
          id: true,
          word: true,
          language: true,
          senses: {
            select: { definition: true },
            take: 1,
            orderBy: { createdAt: 'asc' },
          },
          examples: {
            select: { exampleText: true },
            take: 1,
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      existingEntries = entries.map((entry) => ({
        id: entry.id,
        word: entry.word,
        language: entry.language,
        definition: entry.senses[0]?.definition || null,
        example: entry.examples[0]?.exampleText || null,
      }));
    }

    // Create map for quick lookup
    const existingMap = new Map(
      existingEntries.map((e) => [e.word.toLowerCase(), e])
    );

    // Process each word
    for (const wordInput of words) {
      const word = wordInput.word.trim();
      const wordLower = word.toLowerCase();
      const existing = existingMap.get(wordLower);

      if (existing) {
        // Word exists
        result.set(wordLower, {
          word: word,
          entryId: existing.id,
          isNew: false,
          needsApproval: false,
          definition: existing.definition,
          example: existing.example,
        });
      } else {
        // Word doesn't exist - will create new entry
        result.set(wordLower, {
          word: word,
          entryId: '', // Will be generated when creating
          isNew: true,
          needsApproval: true,
          definition: wordInput.definition,
          example: wordInput.example,
        });
      }
    }

    return result;
  }

  /**
   * Create entries within transaction
   * Optimized: Use nested creates to reduce round-trips
   */
  private async createEntriesInTransaction(
    tx: unknown,
    wordsToCreate: Array<{
      word: string;
      definition?: string;
      example?: string;
    }>,
    language: string
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    const txClient = tx as {
      entry: {
        create: (args: {
          data: {
            word: string;
            language: string;
            isDraft: boolean;
            isPublished: boolean;
            tags: string[];
            senses?: {
              create: {
                definition: string;
                language: string;
              };
            };
            examples?: {
              create: {
                exampleText: string;
                language: string;
              };
            };
          };
          select: { id: true; word: true };
        }) => Promise<{ id: string; word: string }>;
      };
    };

    // Use nested creates for better performance (single query per entry)
    // This reduces round-trips from 3 queries per entry to 1 query per entry
    for (const wordData of wordsToCreate) {
      const entry = await txClient.entry.create({
        data: {
          word: wordData.word.trim(),
          language: language,
          isDraft: true, // New entries are drafts
          isPublished: false, // Need approval before publishing
          tags: [],
          // Nested creates - all in one query
          ...(wordData.definition && {
            senses: {
              create: {
                definition: wordData.definition,
                language: language,
              },
            },
          }),
          ...(wordData.example && {
            examples: {
              create: {
                exampleText: wordData.example,
                language: language,
              },
            },
          }),
        },
        select: { id: true, word: true },
      });

      result.set(wordData.word.toLowerCase(), entry.id);
    }

    return result;
  }
}
