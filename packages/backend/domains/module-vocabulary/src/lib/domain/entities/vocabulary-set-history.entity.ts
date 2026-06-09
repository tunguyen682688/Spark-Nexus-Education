import { Entity } from '@spark-nest-ed/shared-libs';

/**
 * Domain Entity: VocabularySetHistory
 * Represents a study session history for a vocabulary set
 * Maps to vocabulary_set_history table
 *
 * Business Rules:
 * - Tracks completion statistics for study sessions
 * - Used for analytics and progress tracking
 */
export class VocabularySetHistoryEntity extends Entity<string> {
  private constructor(
    id: string,
    private readonly vocabularySetId: string,
    private completedItems: number | null,
    private completionPercentage: number | null,
    private correctAnswers: number | null,
    private lastStudied: Date | null,
    private totalItems: number | null,
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
   * Factory method to create a new VocabularySetHistory
   */
  static create(
    id: string,
    vocabularySetId: string,
    completedItems?: number | null,
    completionPercentage?: number | null,
    correctAnswers?: number | null,
    lastStudied?: Date | null,
    totalItems?: number | null
  ): VocabularySetHistoryEntity {
    const now = new Date();
    return new VocabularySetHistoryEntity(
      id,
      vocabularySetId,
      completedItems || null,
      completionPercentage || null,
      correctAnswers || null,
      lastStudied || null,
      totalItems || null,
      now,
      now,
      false
    );
  }

  /**
   * Factory method to reconstitute from database
   */
  static fromPersistence(data: {
    id: string;
    vocabularySetId: string;
    completedItems: number | null;
    completionPercentage: number | null;
    correctAnswers: number | null;
    lastStudied: Date | null;
    totalItems: number | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
  }): VocabularySetHistoryEntity {
    return new VocabularySetHistoryEntity(
      data.id,
      data.vocabularySetId,
      data.completedItems,
      data.completionPercentage,
      data.correctAnswers,
      data.lastStudied,
      data.totalItems,
      data.createdAt,
      data.updatedAt,
      data.deleted
    );
  }

  // ===== Business Logic Methods =====

  /**
   * Update completion statistics
   */
  updateCompletion(
    completedItems: number,
    totalItems: number,
    correctAnswers?: number
  ): void {
    if (completedItems < 0 || totalItems < 0) {
      throw new Error('Items count cannot be negative');
    }
    if (completedItems > totalItems) {
      throw new Error('Completed items cannot exceed total items');
    }

    this.completedItems = completedItems;
    this.totalItems = totalItems;
    this.completionPercentage =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    this.correctAnswers = correctAnswers ?? null;
    this.lastStudied = new Date();
    this.markAsUpdated();
  }

  /**
   * Update last studied timestamp
   */
  updateLastStudied(): void {
    this.lastStudied = new Date();
    this.markAsUpdated();
  }

  /**
   * Soft delete the history record
   */
  delete(): void {
    this.markAsDeleted();
  }

  // ===== Getters =====

  getId(): string {
    return this._id;
  }

  getVocabularySetId(): string {
    return this.vocabularySetId;
  }

  getCompletedItems(): number | null {
    return this.completedItems;
  }

  getCompletionPercentage(): number | null {
    return this.completionPercentage;
  }

  getCorrectAnswers(): number | null {
    return this.correctAnswers;
  }

  getLastStudied(): Date | null {
    return this.lastStudied;
  }

  getTotalItems(): number | null {
    return this.totalItems;
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
    id: string;
    vocabularySetId: string;
    completedItems: number | null;
    completionPercentage: number | null;
    correctAnswers: number | null;
    lastStudied: Date | null;
    totalItems: number | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
  } {
    return {
      id: this._id,
      vocabularySetId: this.vocabularySetId,
      completedItems: this.completedItems,
      completionPercentage: this.completionPercentage,
      correctAnswers: this.correctAnswers,
      lastStudied: this.lastStudied,
      totalItems: this.totalItems,
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
