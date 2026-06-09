import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ReviewFlashcardCommand } from './review-flashcard.command';
import { UserVocabularyProgressResponseDto } from '../../dtos/flashcard.dto';
import { UserVocabularyProgressEntity } from '../../../domain/entities/user-vocabulary-progress.entity';
import { UserLearningProgressAggregate } from '../../../domain/aggregates/user-learning-progress.aggregate';
import * as vocabularySetItemRepositoryInterface from '../../../domain/repositories/vocabulary-set-item.repository.interface';
import * as userVocabularyProgressRepositoryInterface from '../../../domain/repositories/user-vocabulary-progress.repository.interface';

@CommandHandler(ReviewFlashcardCommand)
export class ReviewFlashcardHandler
  implements ICommandHandler<ReviewFlashcardCommand, UserVocabularyProgressResponseDto>
{
  constructor(
    @Inject(vocabularySetItemRepositoryInterface.VOCABULARY_SET_ITEM_REPOSITORY)
    private readonly vocabularySetItemRepository: vocabularySetItemRepositoryInterface.IVocabularySetItemRepository,
    @Inject(userVocabularyProgressRepositoryInterface.USER_VOCABULARY_PROGRESS_REPOSITORY)
    private readonly userVocabularyProgressRepository: userVocabularyProgressRepositoryInterface.IUserVocabularyProgressRepository
  ) {}

  async execute(command: ReviewFlashcardCommand): Promise<UserVocabularyProgressResponseDto> {
    const { userId, setId, itemId, quality } = command;

    // 1. Verify that the vocabulary set item exists and belongs to the specified set
    const item = await this.vocabularySetItemRepository.findById(itemId);
    if (!item || item.getVocabularySetId() !== setId) {
      throw new NotFoundException(
        `Vocabulary set item with ID ${itemId} not found in set ${setId}`
      );
    }

    // 2. Fetch user progress for this item
    let progress = await this.userVocabularyProgressRepository.findByUserAndItem(userId, itemId);

    // 3. If no progress entry exists, create a new one (First time studying)
    if (!progress) {
      const progressId = randomUUID();
      progress = UserVocabularyProgressEntity.create(progressId, userId, itemId);
    }

    // 4. Reconstitute Aggregate
    const aggregate = UserLearningProgressAggregate.fromPersistence(progress, item);

    // 5. Execute Spaced Repetition (SM-2) algorithm calculations
    aggregate.recordReview(quality);

    // 6. Save updated progress to database
    const savedProgress = await this.userVocabularyProgressRepository.save(progress);
    const data = savedProgress.toPersistence();

    // 7. Return mapped Response DTO
    return {
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
    };
  }
}
