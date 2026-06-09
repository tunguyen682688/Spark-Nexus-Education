import {
  UserVocabularyProgressEntity,
  LearningStatus,
} from '../entities/user-vocabulary-progress.entity';
import { VocabularySetItemEntity } from '../entities/vocabulary-set-item.entity';

/**
 * UserLearningProgressAggregate
 *
 * Aggregate that manages a user's learning progress for vocabulary items.
 * This aggregate handles SRS (Spaced Repetition System) logic and ensures
 * consistency of learning state.
 *
 * Following DDD principles:
 * - UserVocabularyProgressEntity is the Aggregate Root
 * - This aggregate manages the learning lifecycle of a single item for a user
 *
 * Business Rules:
 * - Progress is unique per user per item
 * - SRS algorithm (SM-2) updates must maintain consistency
 * - Status transitions: NEW -> LEARNING -> MASTERED
 * - Mastered items can be reset to NEW for relearning
 */
export class UserLearningProgressAggregate {
  private readonly progress: UserVocabularyProgressEntity;
  private readonly item: VocabularySetItemEntity;

  private constructor(
    progress: UserVocabularyProgressEntity,
    item: VocabularySetItemEntity
  ) {
    this.progress = progress;
    this.item = item;
  }

  /**
   * Create a new UserLearningProgressAggregate
   * This is the primary factory method
   */
  static create(
    progressId: string,
    userId: string,
    item: VocabularySetItemEntity
  ): UserLearningProgressAggregate {
    const progress = UserVocabularyProgressEntity.create(
      progressId,
      userId,
      item.getId()
    );

    return new UserLearningProgressAggregate(progress, item);
  }

  /**
   * Factory method to reconstitute from database
   */
  static fromPersistence(
    progress: UserVocabularyProgressEntity,
    item: VocabularySetItemEntity
  ): UserLearningProgressAggregate {
    return new UserLearningProgressAggregate(progress, item);
  }

  // ===== SRS Algorithm Methods =====

  /**
   * Record a review using SM-2 algorithm
   * Quality: 0-5 (0=blackout, 1=incorrect, 2=incorrect but remembered, 3=correct with difficulty, 4=correct, 5=perfect)
   */
  recordReview(quality: number): void {
    if (quality < 0 || quality > 5) {
      throw new Error('Quality must be between 0 and 5');
    }

    const currentEaseFactor = this.progress.getEaseFactor();
    const currentInterval = this.progress.getInterval();
    const currentRepetitions = this.progress.getRepetitions();

    // SM-2 Algorithm
    let newEaseFactor: number;
    let newInterval: number;
    let newRepetitions: number;

    if (quality < 3) {
      // Failed review - reset
      newRepetitions = 0;
      newInterval = 1; // Review again tomorrow
      newEaseFactor = Math.max(1.3, currentEaseFactor - 0.15);
    } else {
      // Successful review
      newRepetitions = currentRepetitions + 1;

      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(currentInterval * currentEaseFactor);
      }

      // Cap interval to a maximum of 365 days (1 year)
      newInterval = Math.min(365, newInterval);

      // Update ease factor based on quality
      newEaseFactor =
        currentEaseFactor +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      newEaseFactor = Math.max(1.3, newEaseFactor);
    }

    // Calculate next review date
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

    // Update status
    let newStatus: LearningStatus = this.progress.getStatus();
    if (newRepetitions >= 5) {
      newStatus = 'MASTERED';
    } else if (newStatus === 'NEW' && quality >= 3) {
      newStatus = 'LEARNING';
    } else if (newStatus === 'MASTERED' && quality < 3) {
      newStatus = 'LEARNING';
    }

    // Update mastery level
    const masteryLevel = Math.max(
      0.0,
      Math.min(
        1.0,
        newRepetitions * 0.2 + (newEaseFactor - 2.0) * 0.1
      )
    );

    // Record the review
    this.progress.recordReview(
      quality,
      nextReviewAt,
      newInterval,
      newEaseFactor
    );

    // Update status if needed
    if (newStatus !== this.progress.getStatus()) {
      this.progress.updateStatus(newStatus);
    }

    // Update mastery level
    this.progress.updateMasteryLevel(masteryLevel);
  }

  /**
   * Mark as mastered (skip SRS)
   */
  markAsMastered(): void {
    this.progress.markAsMastered();
  }

  /**
   * Reset to new (for relearning)
   */
  resetToNew(): void {
    this.progress.resetToNew();
  }

  /**
   * Check if item is due for review
   */
  isDueForReview(): boolean {
    return this.progress.isDueForReview();
  }

  /**
   * Get days until next review
   */
  getDaysUntilReview(): number | null {
    const nextReviewAt = this.progress.getNextReviewAt();
    if (!nextReviewAt) {
      return null;
    }

    const now = new Date();
    const diffTime = nextReviewAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  // ===== Getters =====

  /**
   * Get progress entity (Aggregate Root)
   */
  getProgress(): UserVocabularyProgressEntity {
    return this.progress;
  }

  /**
   * Get vocabulary set item
   */
  getItem(): VocabularySetItemEntity {
    return this.item;
  }

  /**
   * Get learning status
   */
  getStatus(): LearningStatus {
    return this.progress.getStatus();
  }

  /**
   * Get mastery level (0-1)
   */
  getMasteryLevel(): number {
    return this.progress.getMasteryLevel();
  }

  /**
   * Get streak (consecutive study days)
   */
  getStreak(): number {
    return this.progress.getStreak();
  }

  /**
   * Get next review date
   */
  getNextReviewAt(): Date | null {
    return this.progress.getNextReviewAt();
  }
}
