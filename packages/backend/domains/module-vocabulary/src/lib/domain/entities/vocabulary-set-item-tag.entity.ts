import { Entity } from '@spark-nest-ed/shared-libs';

/**
 * Domain Entity: VocabularySetItemTag
 * Represents the relationship between a vocabulary set item and a tag (junction table)
 * Maps to vocabulary_set_item_tags table
 *
 * Business Rules:
 * - Composite primary key: itemId + tagId
 * - One item can have multiple tags
 * - One tag can be applied to multiple items
 * - User-specific tagging (userId tracks who created the relationship)
 */
export class VocabularySetItemTagEntity extends Entity<{
  itemId: string;
  tagId: string;
}> {
  private constructor(
    id: { itemId: string; tagId: string },
    private readonly userId: string,
    createdAt: Date
  ) {
    super(id, createdAt, createdAt, BigInt(1));
  }

  /**
   * Factory method to create a new VocabularySetItemTag
   */
  static create(
    itemId: string,
    tagId: string,
    userId: string
  ): VocabularySetItemTagEntity {
    const now = new Date();
    return new VocabularySetItemTagEntity({ itemId, tagId }, userId, now);
  }

  /**
   * Factory method to reconstitute from database
   */
  static fromPersistence(data: {
    itemId: string;
    tagId: string;
    userId: string;
    createdAt: Date;
  }): VocabularySetItemTagEntity {
    return new VocabularySetItemTagEntity(
      { itemId: data.itemId, tagId: data.tagId },
      data.userId,
      data.createdAt
    );
  }

  // ===== Getters =====

  getItemId(): string {
    return this._id.itemId;
  }

  getTagId(): string {
    return this._id.tagId;
  }

  getUserId(): string {
    return this.userId;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  /**
   * Convert to persistence format
   */
  toPersistence(): {
    itemId: string;
    tagId: string;
    userId: string;
    createdAt: Date;
  } {
    return {
      itemId: this._id.itemId,
      tagId: this._id.tagId,
      userId: this.userId,
      createdAt: this._createdAt,
    };
  }

  /**
   * Convert to plain object (required by Entity base class)
   */
  toPlainObject(): Record<string, unknown> {
    return this.toPersistence();
  }
}
