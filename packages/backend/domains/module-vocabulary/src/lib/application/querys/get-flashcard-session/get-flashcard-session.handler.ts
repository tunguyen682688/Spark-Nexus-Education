import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetFlashcardSessionQuery } from './get-flashcard-session.query';
import {
  FlashcardSessionResponseDto,
  FlashcardSessionWordDto,
  UserVocabularyProgressResponseDto,
} from '../../dtos/flashcard.dto';
import { VocabularySetItemDto, WordMinimumDto } from '../../dtos/reponse-word.dto';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';
import * as vocabularySetItemRepositoryInterface from '../../../domain/repositories/vocabulary-set-item.repository.interface';
import * as userVocabularyProgressRepositoryInterface from '../../../domain/repositories/user-vocabulary-progress.repository.interface';
import * as entryRepositoryInterface from '../../../domain/repositories/entry.repository.interface';

@QueryHandler(GetFlashcardSessionQuery)
export class GetFlashcardSessionQueryHandler
  implements IQueryHandler<GetFlashcardSessionQuery, FlashcardSessionResponseDto>
{
  constructor(
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    @Inject(vocabularySetItemRepositoryInterface.VOCABULARY_SET_ITEM_REPOSITORY)
    private readonly vocabularySetItemRepository: vocabularySetItemRepositoryInterface.IVocabularySetItemRepository,
    @Inject(userVocabularyProgressRepositoryInterface.USER_VOCABULARY_PROGRESS_REPOSITORY)
    private readonly userVocabularyProgressRepository: userVocabularyProgressRepositoryInterface.IUserVocabularyProgressRepository,
    @Inject(entryRepositoryInterface.ENTRY_REPOSITORY)
    private readonly entryRepository: entryRepositoryInterface.IEntryRepository
  ) {}

  async execute(query: GetFlashcardSessionQuery): Promise<FlashcardSessionResponseDto> {
    const { userId, setId, reviewAll } = query;

    // 1. Verify vocabulary set exists
    const vocabularySet = await this.vocabularySetRepository.findById(setId);
    if (!vocabularySet) {
      throw new NotFoundException(`Vocabulary set with ID ${setId} not found`);
    }

    // 2. Fetch all items in the vocabulary set (limit to 1000 for study session)
    const result = await this.vocabularySetItemRepository.findByVocabularySetId(setId, {
      page: 1,
      limit: 1000,
    });

    const items = result.items;
    if (items.length === 0) {
      return {
        id: vocabularySet.getId(),
        setId: vocabularySet.getId(),
        title: vocabularySet.getTitle(),
        description: vocabularySet.getDescription() || undefined,
        streak: 0,
        words: [],
      };
    }

    // 3. Fetch user progress entries for all these items
    const itemIds = items.map((item) => item.getId());
    const progressList = await this.userVocabularyProgressRepository.findByUserAndItems(userId, itemIds);

    // Map progress by itemId for fast lookup
    const progressMap = new Map<string, UserVocabularyProgressResponseDto>();
    progressList.forEach((progress) => {
      const data = progress.toPersistence();
      progressMap.set(data.itemId, {
        id: data.id,
        userId: data.userId,
        itemId: data.itemId,
        status: data.status,
        streak: data.streak,
        masteryLevel: data.masteryLevel,
        lastReview: data.lastReview,
        nextReviewAt: data.nextReviewAt,
        interval: data.interval,
        easeFactor: data.easeFactor,
        repetitions: data.repetitions,
      });
    });

    // 4. Fetch minimum word details (IPA, parts of speech, etc.)
    const entryIds = items.map((item) => item.getEntryId());
    const minimumDetails = await this.entryRepository.findByIdsMinimum(entryIds);
    const wordDetailsMap = new Map<string, WordMinimumDto>();
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

    // 5. Get user study streak
    const streak = await this.userVocabularyProgressRepository.getUserStreak(userId);

    // 6. Map everything to FlashcardSessionWordDto
    const words: FlashcardSessionWordDto[] = items.map((item) => {
      const entryId = item.getEntryId();
      const wordMinimum = wordDetailsMap.get(entryId) || {
        id: entryId,
        word: item.getWord(),
        definition: item.getDefinition() || '',
        example: item.getExample() || '',
        pronunciation: null,
        partOfSpeech: null,
      };

      const itemDto: VocabularySetItemDto = {
        id: item.getId(),
        entryId: item.getEntryId(),
        vocabularySetId: item.getVocabularySetId(),
        customWord: item.getWord(),
        customDefinition: item.getDefinition(),
        customExample: item.getExample(),
        notes: item.getNotes(),
        position: item.getPosition(),
        addedAt: item.getAddedAt(),
        wordMinimum,
      };

      const progressDto = progressMap.get(item.getId()) || null;

      return {
        item: itemDto,
        progress: progressDto,
      };
    });

    // 7. Apply Spaced Repetition (SRS) filtering by default
    let filteredWords = words;
    if (!reviewAll) {
      const now = new Date();
      filteredWords = words.filter((word) => {
        // New words (never studied) are always included
        if (!word.progress) {
          return true;
        }
        // Words without explicit next review date (e.g. error states or manually reset) are included
        if (!word.progress.nextReviewAt) {
          return true;
        }
        // Words that are due for review (nextReviewAt <= now) are included
        return new Date(word.progress.nextReviewAt) <= now;
      });

      // Sort: due cards first (ascending order of nextReviewAt), then new cards
      filteredWords.sort((a, b) => {
        if (a.progress && b.progress) {
          const aTime = a.progress.nextReviewAt ? new Date(a.progress.nextReviewAt).getTime() : 0;
          const bTime = b.progress.nextReviewAt ? new Date(b.progress.nextReviewAt).getTime() : 0;
          return aTime - bTime;
        }
        if (a.progress) return -1;
        if (b.progress) return 1;
        return 0;
      });
    }

    return {
      id: vocabularySet.getId(),
      setId: vocabularySet.getId(),
      title: vocabularySet.getTitle(),
      description: vocabularySet.getDescription() || undefined,
      streak,
      words: filteredWords,
    };
  }
}
