import { UserVocabularyProgressEntity } from '../entities/user-vocabulary-progress.entity';

/**
 * Repository Interface for UserVocabularyProgress
 * Defines contract for spaced repetition (SRS) progress operations
 */
export interface IUserVocabularyProgressRepository {
  /**
   * Find progress by ID
   */
  findById(id: string): Promise<UserVocabularyProgressEntity | null>;

  /**
   * Find progress for a specific user and vocabulary set item
   */
  findByUserAndItem(userId: string, itemId: string): Promise<UserVocabularyProgressEntity | null>;

  /**
   * Find all progress entries for a user in a list of item IDs
   */
  findByUserAndItems(userId: string, itemIds: string[]): Promise<UserVocabularyProgressEntity[]>;

  /**
   * Save or update progress
   */
  save(progress: UserVocabularyProgressEntity): Promise<UserVocabularyProgressEntity>;

  /**
   * Get the current streak (consecutive days of study) of the user
   */
  getUserStreak(userId: string): Promise<number>;
}

/**
 * Token for NestJS dependency injection
 */
export const USER_VOCABULARY_PROGRESS_REPOSITORY = 'IUserVocabularyProgressRepository';
