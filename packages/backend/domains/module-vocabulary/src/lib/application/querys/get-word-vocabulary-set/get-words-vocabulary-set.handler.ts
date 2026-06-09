import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetWordsVocabularySetQuery } from './get-words-vocabulary-set.query';
import { VocabularySetWordsResponseDto, VocabularySetItemDto, WordMinimumDto, WordFullDto } from '../../dtos/reponse-word.dto';
import * as vocabularySetItemRepositoryInterface from '../../../domain/repositories/vocabulary-set-item.repository.interface';
import * as entryRepositoryInterface from '../../../domain/repositories/entry.repository.interface';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';
import {
  normalizeQueryParams,
  QueryParams,
} from '@spark-nest-ed/shared-libs';
import * as userVocabularyProgressRepositoryInterface from '../../../domain/repositories/user-vocabulary-progress.repository.interface';

@QueryHandler(GetWordsVocabularySetQuery)
export class GetWordsVocabularySetQueryHandler
  implements IQueryHandler<GetWordsVocabularySetQuery, VocabularySetWordsResponseDto>
{
  constructor(
    @Inject(vocabularySetItemRepositoryInterface.VOCABULARY_SET_ITEM_REPOSITORY)
    private readonly vocabularySetItemRepository: vocabularySetItemRepositoryInterface.IVocabularySetItemRepository,
    @Inject(entryRepositoryInterface.ENTRY_REPOSITORY)
    private readonly entryRepository: entryRepositoryInterface.IEntryRepository,
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    @Inject(userVocabularyProgressRepositoryInterface.USER_VOCABULARY_PROGRESS_REPOSITORY)
    private readonly userVocabularyProgressRepository: userVocabularyProgressRepositoryInterface.IUserVocabularyProgressRepository
  ) {}

  async execute(query: GetWordsVocabularySetQuery): Promise<VocabularySetWordsResponseDto> {
    // Verify vocabulary set exists
    const vocabularySet = await this.vocabularySetRepository.findById(query.vocabularySetId);
    if (!vocabularySet) {
      throw new NotFoundException(`Vocabulary set with ID ${query.vocabularySetId} not found`);
    }

    // Normalize query params using query system
    const normalizedParams = normalizeQueryParams(query.params || {});
    const includeDetails = query.params?.includeDetails || 'minimum';

    // Extract vocabulary-specific params and pass QueryParams to repository
    // Repository will handle filtering, sorting, and pagination
    const repositoryQueryParams: QueryParams = {
      ...normalizedParams,
    };
    // Remove includeDetails as it's not a repository concern
    delete (repositoryQueryParams as { includeDetails?: string }).includeDetails;

    // Fetch vocabulary set items with advanced query support
    const result = await this.vocabularySetItemRepository.findByVocabularySetId(
      query.vocabularySetId,
      repositoryQueryParams
    );

    // Extract entry IDs
    const entryIds = result.items.map((item) => item.getEntryId());

    // Fetch user progress for all items in the set if userId is provided
    const progressMap = new Map<string, any>();
    if (query.userId && result.items.length > 0) {
      const itemIds = result.items.map((item) => item.getId());
      const progressList = await this.userVocabularyProgressRepository.findByUserAndItems(
        query.userId,
        itemIds
      );
      progressList.forEach((prog) => {
        progressMap.set(prog.toPersistence().itemId, prog);
      });
    }

    // Fetch word details based on requested level
    const wordDetailsMap: Map<string, WordMinimumDto | WordFullDto> = new Map();

    if (includeDetails === 'full') {
      // Fetch full details for all entries
      const fullDetailsPromises = entryIds.map((entryId) =>
        this.entryRepository.findByIdWithDetails(entryId)
      );
      const fullDetails = await Promise.all(fullDetailsPromises);

      fullDetails.forEach((entry) => {
        if (entry) {
          wordDetailsMap.set(entry.id, {
            id: entry.id,
            word: entry.word,
            language: entry.language,
            pronunciation: entry.pronunciation,
            partOfSpeech: entry.partOfSpeech,
            frequency: entry.frequency,
            isDraft: entry.isDraft,
            isPublished: entry.isPublished,
            notes: entry.notes,
            sourceUrl: entry.sourceUrl,
            tags: entry.tags,
            audioUrl: entry.audioUrl,
            senses: entry.senses.map((sense) => ({
              id: sense.id,
              definition: sense.definition,
              partOfSpeech: sense.partOfSpeech,
              level: sense.level,
              topic: sense.topic,
              synonym: sense.synonym,
              antonym: sense.antonym,
              usage: sense.usage,
              etymologyText: sense.etymologyText,
              fieldOfStudy: sense.fieldOfStudy,
              note: sense.note,
              seeAlso: sense.seeAlso,
              images: sense.images,
            })),
            examples: entry.examples.map((ex) => ({
              id: ex.id,
              exampleText: ex.exampleText,
              translation: ex.translation,
            })),
            expressions: entry.expressions.map((expr) => ({
              id: expr.id,
              expression: expr.expression,
              meanings: expr.meanings.map((m) => ({
                id: m.id,
                meaningText: m.meaningText,
                meaningOrder: m.meaningOrder,
                usageNotes: m.usageNotes,
              })),
            })),
            lexicalVariants: entry.variants.map((variant) => ({
              id: variant.id,
              partOfSpeech: variant.partOfSpeech,
              pronunciation: variant.pronunciation,
              notes: variant.notes,
            })),
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
          } as WordFullDto);
        }
      });
    } else if (includeDetails === 'minimum') {
      // Fetch minimum details for all entries
      const minimumDetails = await this.entryRepository.findByIdsMinimum(entryIds);
      minimumDetails.forEach((entry) => {
        wordDetailsMap.set(entry.id, {
          id: entry.id,
          word: entry.word,
          definition: entry.definition,
          example: entry.example,
          pronunciation: entry.pronunciation,
          partOfSpeech: entry.partOfSpeech,
        } as WordMinimumDto);
      });
    }

    // Map items to DTOs
    const items: VocabularySetItemDto[] = result.items.map((item) => {
      const itemDto: VocabularySetItemDto = {
        id: item.getId(),
        entryId: item.getEntryId(),
        vocabularySetId: item.getVocabularySetId(),
        // Per-set / per-user customizations
        customWord: item.getWord(),
        customDefinition: item.getDefinition(),
        customExample: item.getExample(),
        notes: item.getNotes(),
        position: item.getPosition(),
        addedAt: item.getAddedAt(),
      };

      // Attach user progress if exists
      const progress = progressMap.get(item.getId());
      if (progress) {
        const progData = progress.toPersistence();
        itemDto.userProgress = {
          id: progData.id,
          userId: progData.userId,
          itemId: progData.itemId,
          status: progData.status,
          streak: progData.streak,
          masteryLevel: progData.masteryLevel,
          lastReview: progData.lastReview,
          nextReviewAt: progData.nextReviewAt,
          interval: progData.interval,
          easeFactor: progData.easeFactor,
          repetitions: progData.repetitions,
        };
      }

      // Attach word details if requested
      const wordDetails = wordDetailsMap.get(item.getEntryId());
      if (wordDetails) {
        if (includeDetails === 'full') {
          itemDto.wordDetails = wordDetails as WordFullDto;
        } else if (includeDetails === 'minimum') {
          itemDto.wordMinimum = wordDetails as WordMinimumDto;
        }
      }

      return itemDto;
    });

    // Build pagination metadata
    const hasNext = result.page < result.totalPages;
    const hasPrev = result.page > 1;

    return {
      data: items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext,
        hasPrev,
      },
      links: {
        self: `?page=${result.page}&limit=${result.limit}`,
        first: result.totalPages > 0 ? `?page=1&limit=${result.limit}` : undefined,
        last: result.totalPages > 0 ? `?page=${result.totalPages}&limit=${result.limit}` : undefined,
        prev: hasPrev ? `?page=${result.page - 1}&limit=${result.limit}` : null,
        next: hasNext ? `?page=${result.page + 1}&limit=${result.limit}` : null,
      },
    };
  }
}

