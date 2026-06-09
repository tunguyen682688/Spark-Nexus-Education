import { VocabularySetItemEntity } from '../entities/vocabulary-set-item.entity';
import { QueryParams } from '@spark-nest-ed/shared-libs';

/**
 * Repository Interface for VocabularySetItem
 * Defines contract for persistence operations
 * Infrastructure layer will implement this
 */
export interface IVocabularySetItemRepository {
  /**
   * Add an entry to a vocabulary set
   */
  create(item: VocabularySetItemEntity): Promise<VocabularySetItemEntity>;

  /**
   * Batch create items (for performance optimization)
   */
  createMany(
    items: VocabularySetItemEntity[]
  ): Promise<VocabularySetItemEntity[]>;

  /**
   * Create items within a transaction
   */
  createManyInTransaction(
    tx: unknown,
    items: VocabularySetItemEntity[]
  ): Promise<void>;

  /**
   * Find items by vocabulary set ID with advanced query support
   * Supports filtering, sorting, and pagination via QueryParams
   */
  findByVocabularySetId(
    vocabularySetId: string,
    queryParams?: QueryParams
  ): Promise<{
    items: VocabularySetItemEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Find a single item by ID
   */
  findById(id: string): Promise<VocabularySetItemEntity | null>;

  /**
   * Find a single item by Set ID and Entry ID
   */
  findBySetAndEntryId(
    vocabularySetId: string,
    entryId: string
  ): Promise<VocabularySetItemEntity | null>;

  /**
   * Update an existing item
   */
  update(item: VocabularySetItemEntity): Promise<VocabularySetItemEntity>;

  /**
   * Soft delete an item by ID
   */
  softDelete(id: string): Promise<void>;
}

/**
 * Token for dependency injection
 */
export const VOCABULARY_SET_ITEM_REPOSITORY = 'IVocabularySetItemRepository';
