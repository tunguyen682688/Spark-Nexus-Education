import { QueryParams } from '@spark-nest-ed/shared-libs';
import { VocabularySetEntity } from '../entities/vocabulary-set.entity';

/**
 * Repository Interface for VocabularySet
 * Defines contract for persistence operations
 * Infrastructure layer will implement this
 */
export interface IVocabularySetRepository {
  /**
   * Create a new vocabulary set
   */
  create(vocabularySet: VocabularySetEntity): Promise<VocabularySetEntity>;

  /**
   * Update vocabulary set
   */
  update(vocabularySet: VocabularySetEntity): Promise<VocabularySetEntity>;

  /**
   * Find by ID
   */
  findById(id: string): Promise<VocabularySetEntity | null>;

  /**
   * Create within a transaction
   */
  createInTransaction(
    tx: unknown,
    vocabularySet: VocabularySetEntity
  ): Promise<VocabularySetEntity>;

  /**
   * Update entry count within a transaction
   */
  updateEntryCountInTransaction(
    tx: unknown,
    setId: string,
    count: number
  ): Promise<void>;


  /**
   * Find community vocabulary sets
   */
  findCommunityVocabularySets(
    queryParams?: QueryParams
  ): Promise<{
    items: VocabularySetEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Find vocabulary sets created by a specific user
   */
  findByUserId(
    userId: string,
    queryParams?: QueryParams
  ): Promise<{
    items: VocabularySetEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Find vocabulary sets favorited by a specific user
   */
  findFavoritesByUserId(
    userId: string,
    queryParams?: QueryParams
  ): Promise<{
    items: VocabularySetEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Check if a user has favorited a vocabulary set
   */
  isFavorited(userId: string, vocabularySetId: string): Promise<boolean>;

  /**
   * Add vocabulary set to user's favorites
   */
  addFavorite(userId: string, vocabularySetId: string): Promise<void>;

  /**
   * Remove vocabulary set from user's favorites
   */
  removeFavorite(userId: string, vocabularySetId: string): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const VOCABULARY_SET_REPOSITORY = 'IVocabularySetRepository';
