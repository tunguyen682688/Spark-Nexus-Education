import { Entity } from '@spark-nest-ed/shared-libs';

/**
 * Domain Entity: UserVocabularySetFavorite
 * Represents a user's favorite vocabulary set (junction table)
 * Maps to user_vocabulary_set_favorites table
 *
 * Business Rules:
 * - Composite primary key: userId + vocabularySetId
 * - One user can favorite a set only once
 */
export class UserVocabularySetFavoriteEntity extends Entity<{
  userId: string;
  vocabularySetId: string;
}> {
  private constructor(
    id: { userId: string; vocabularySetId: string },
    private readonly favoritedAt: Date,
    createdAt: Date,
    updatedAt: Date,
    deleted: boolean
  ) {
    super(id, createdAt, updatedAt, BigInt(1));
    if (deleted) {
      this.markAsDeleted();
    }
  }

  /**
   * Factory method to create a new UserVocabularySetFavorite
   */
  static create(
    userId: string,
    vocabularySetId: string
  ): UserVocabularySetFavoriteEntity {
    const now = new Date();
    return new UserVocabularySetFavoriteEntity(
      { userId, vocabularySetId },
      now,
      now,
      now,
      false
    );
  }

  /**
   * Factory method to reconstitute from database
   */
  static fromPersistence(data: {
    userId: string;
    vocabularySetId: string;
    favoritedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
  }): UserVocabularySetFavoriteEntity {
    return new UserVocabularySetFavoriteEntity(
      { userId: data.userId, vocabularySetId: data.vocabularySetId },
      data.favoritedAt,
      data.createdAt,
      data.updatedAt,
      data.deleted
    );
  }

  /**
   * Soft delete the favorite (unfavorite)
   */
  delete(): void {
    this.markAsDeleted();
  }

  // ===== Getters =====

  getUserId(): string {
    return this._id.userId;
  }

  getVocabularySetId(): string {
    return this._id.vocabularySetId;
  }

  getFavoritedAt(): Date {
    return this.favoritedAt;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  isDeleted(): boolean {
    return this._deleted;
  }

  /**
   * Convert to persistence format
   */
  toPersistence(): {
    userId: string;
    vocabularySetId: string;
    favoritedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
  } {
    return {
      userId: this._id.userId,
      vocabularySetId: this._id.vocabularySetId,
      favoritedAt: this.favoritedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deleted: this._deleted,
    };
  }

  /**
   * Convert to plain object (required by Entity base class)
   */
  toPlainObject(): Record<string, unknown> {
    return this.toPersistence();
  }
}
