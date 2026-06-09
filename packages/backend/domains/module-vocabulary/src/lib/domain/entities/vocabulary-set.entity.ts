import { AggregateRoot } from '@spark-nest-ed/shared-libs';
import { DifficultyVO } from '../value-objects/difficulty.vo';
import { LanguageVO } from '../value-objects/language.vo';
import { SetTypeVO } from '../value-objects/set-type.vo';
import {
  VocabularySetCreatedEvent,
  VocabularySetUpdatedEvent,
  VocabularySetPublishedEvent,
  VocabularySetDeletedEvent,
  EntryAddedToSetEvent,
} from '../events';

/**
 * Domain Entity: VocabularySet (Aggregate Root)
 * Represents a collection of vocabulary words (Package)
 * Maps to vocabulary_sets table
 *
 * Business Rules:
 * - A set must have a non-empty title
 * - Public sets require description and category
 * - A set must have at least minWords to be published (default: 10)
 * - Only the owner can modify private sets
 * - Public sets go through moderation
 */
/**
 * Import Status Types
 */
export type ImportStatus =
  | 'idle'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

/**
 * Import Progress Structure
 */
export interface ImportProgress {
  total: number;
  processed: number;
  failed: number;
  failedItems?: Array<{ word: string; reason: string }>;
  lastError?: string;
}

export class VocabularySetEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private title: string,
    private description: string | null,
    private readonly language: LanguageVO,
    private readonly type: SetTypeVO,
    private difficulty: DifficultyVO | null,
    private isPublic: boolean,
    private isActive: boolean,
    private tags: string[],
    private coverImage: string | null,
    private readonly userId: string,
    private entryCount: number,
    private favoriteCount: number,
    private studyCount: number,
    private importStatus: ImportStatus,
    private importProgress: ImportProgress | null,
    createdAt: Date,
    updatedAt: Date,
    deleted: boolean,
    version: bigint
  ) {
    super(id, createdAt, updatedAt, version);
    if (deleted) {
      this.markAsDeleted();
    }
  }

  /**
   * Factory method to create a new VocabularySet
   * This is the primary way to create a new aggregate root
   */
  static create(
    id: string,
    title: string,
    description: string | null,
    language: LanguageVO,
    type: SetTypeVO,
    userId: string,
    difficulty?: DifficultyVO | null,
    tags?: string[]
  ): VocabularySetEntity {
    // Business Rule: Title must not be empty
    if (!title || title.trim().length === 0) {
      throw new Error('Vocabulary set title cannot be empty');
    }

    // Business Rule: Title length validation
    if (title.length > 200) {
      throw new Error('Vocabulary set title cannot exceed 200 characters');
    }

    const now = new Date();
    const entity = new VocabularySetEntity(
      id,
      title.trim(),
      description,
      language,
      type,
      difficulty || null,
      false, // isPublic: default private
      true, // isActive: default active
      tags || [],
      null, // coverImage
      userId,
      0, // entryCount
      0, // favoriteCount
      0, // studyCount
      'idle', // importStatus: default idle
      null, // importProgress: null when idle
      now,
      now,
      false,
      BigInt(1)
    );

    // Raise domain event
    entity.addDomainEvent(
      new VocabularySetCreatedEvent(
        entity._id,
        userId,
        title.trim(),
        language.getValue(),
        type.getValue()
      )
    );

    return entity;
  }

  /**
   * Factory method to reconstitute from database
   * Used when loading existing aggregates from persistence
   * No domain events are raised when reconstituting
   */
  static fromPersistence(data: {
    id: string;
    title: string;
    description: string | null;
    language: string;
    type: string;
    difficulty: string | null;
    isPublic: boolean;
    isActive: boolean;
    tags: string[];
    coverImage: string | null;
    userId: string;
    entryCount: number;
    favoriteCount: number;
    studyCount: number;
    importStatus?: string | null;
    importProgress?: ImportProgress | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number | bigint;
  }): VocabularySetEntity {
    const version =
      typeof data.version === 'bigint' ? data.version : BigInt(data.version);
    return new VocabularySetEntity(
      data.id,
      data.title,
      data.description,
      LanguageVO.create(data.language),
      SetTypeVO.create(data.type),
      data.difficulty ? DifficultyVO.create(data.difficulty) : null,
      data.isPublic,
      data.isActive,
      data.tags,
      data.coverImage,
      data.userId,
      data.entryCount,
      data.favoriteCount,
      data.studyCount,
      (data.importStatus as ImportStatus) || 'idle',
      data.importProgress || null,
      data.createdAt,
      data.updatedAt,
      data.deleted,
      version
    );
  }

  // ===== Business Logic Methods =====

  /**
   * Update set information
   */
  updateInfo(title?: string, description?: string): void {
    const changes: { title?: string; description?: string } = {};

    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        throw new Error('Vocabulary set title cannot be empty');
      }
      if (title.length > 200) {
        throw new Error('Vocabulary set title cannot exceed 200 characters');
      }
      this.title = title.trim();
      changes.title = this.title;
    }

    if (description !== undefined) {
      this.description = description;
      changes.description = description;
    }

    this.markAsUpdated();

    // Raise domain event
    this.addDomainEvent(
      new VocabularySetUpdatedEvent(this._id, this.userId, changes)
    );
  }

  /**
   * Update difficulty level
   */
  updateDifficulty(difficulty: DifficultyVO): void {
    this.difficulty = difficulty;
    this.markAsUpdated();

    // Raise domain event
    this.addDomainEvent(
      new VocabularySetUpdatedEvent(this._id, this.userId, {
        difficulty: difficulty.getValue(),
      })
    );
  }

  /**
   * Add tags to the set
   */
  addTags(newTags: string[]): void {
    const uniqueTags = new Set([...this.tags, ...newTags]);
    this.tags = Array.from(uniqueTags);
    this.markAsUpdated();

    // Raise domain event
    this.addDomainEvent(
      new VocabularySetUpdatedEvent(this._id, this.userId, {
        tags: [...this.tags],
      })
    );
  }

  /**
   * Remove tags from the set
   */
  removeTags(tagsToRemove: string[]): void {
    this.tags = this.tags.filter((tag) => !tagsToRemove.includes(tag));
    this.markAsUpdated();

    // Raise domain event
    this.addDomainEvent(
      new VocabularySetUpdatedEvent(this._id, this.userId, {
        tags: [...this.tags],
      })
    );
  }

  /**
   * Replace all tags with a new list
   */
  setTags(tags: string[]): void {
    const normalized = Array.from(new Set((tags || []).map((tag) => tag.trim())))
      .filter((tag) => tag.length > 0);
    this.tags = normalized;
    this.markAsUpdated();

    this.addDomainEvent(
      new VocabularySetUpdatedEvent(this._id, this.userId, {
        tags: [...this.tags],
      })
    );
  }

  /**
   * Set cover image
   */
  setCoverImage(imageUrl: string): void {
    this.coverImage = imageUrl;
    this.markAsUpdated();

    // Raise domain event
    this.addDomainEvent(
      new VocabularySetUpdatedEvent(this._id, this.userId, {
        coverImage: imageUrl,
      })
    );
  }

  /**
   * Validate if set can be published (Business Rule)
   */
  canBePublished(minWords = 10): { canPublish: boolean; reasons: string[] } {
    const reasons: string[] = [];

    if (!this.description || this.description.trim().length === 0) {
      reasons.push('Description is required for public sets');
    }

    if (this.tags.length === 0) {
      reasons.push('At least one tag/category is required for public sets');
    }

    if (this.entryCount < minWords) {
      reasons.push(
        `Set must have at least ${minWords} words (current: ${this.entryCount})`
      );
    }

    if (!this.isActive) {
      reasons.push('Set must be active to be published');
    }

    return {
      canPublish: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Publish the set (make it public)
   */
  publish(minWords = 10): void {
    const validation = this.canBePublished(minWords);
    if (!validation.canPublish) {
      throw new Error(`Cannot publish set: ${validation.reasons.join(', ')}`);
    }

    this.isPublic = true;
    this.markAsUpdated();

    // Raise domain event
    this.addDomainEvent(
      new VocabularySetPublishedEvent(
        this._id,
        this.userId,
        this.title,
        this.entryCount
      )
    );
  }

  /**
   * Unpublish the set (make it private)
   */
  unpublish(): void {
    this.isPublic = false;
    this.markAsUpdated();
  }

  /**
   * Deactivate the set
   */
  deactivate(): void {
    this.isActive = false;
    this.markAsUpdated();
  }

  /**
   * Activate the set
   */
  activate(): void {
    this.isActive = true;
    this.markAsUpdated();
  }

  /**
   * Soft delete the set
   */
  delete(): void {
    this.markAsDeleted();
    this.isPublic = false;
    this.isActive = false;

    // Raise domain event
    this.addDomainEvent(new VocabularySetDeletedEvent(this._id, this.userId));
  }

  /**
   * Increment entry count (called when adding word)
   */
  incrementEntryCount(): void {
    this.entryCount++;
    this.markAsUpdated();
  }

  /**
   * Raise entry added to set event
   * Public method to allow aggregate helpers to raise events
   */
  raiseEntryAddedEvent(entryId: string, itemId: string): void {
    this.addDomainEvent(
      new EntryAddedToSetEvent(this._id, entryId, itemId, this.userId)
    );
  }

  /**
   * Decrement entry count (called when removing word)
   */
  decrementEntryCount(): void {
    if (this.entryCount > 0) {
      this.entryCount--;
      this.markAsUpdated();
    }
  }

  /**
   * Set entry count directly (for batch operations)
   */
  setEntryCount(count: number): void {
    if (count < 0) {
      throw new Error('Entry count cannot be negative');
    }
    this.entryCount = count;
    this.markAsUpdated();
  }

  // ===== Import Status Methods =====

  /**
   * Set import status
   */
  setImportStatus(status: ImportStatus): void {
    this.importStatus = status;
    this.markAsUpdated();
  }

  /**
   * Set import progress
   */
  setImportProgress(progress: ImportProgress | null): void {
    this.importProgress = progress;
    this.markAsUpdated();
  }

  /**
   * Update import progress (increment processed count)
   */
  updateImportProgress(
    processed: number,
    failed = 0,
    failedItems?: Array<{ word: string; reason: string }>
  ): void {
    if (!this.importProgress) {
      throw new Error('Import progress not initialized');
    }

    this.importProgress.processed = processed;
    this.importProgress.failed = failed;
    if (failedItems) {
      this.importProgress.failedItems = failedItems;
    }

    this.markAsUpdated();
  }

  /**
   * Mark import as completed
   */
  markImportCompleted(): void {
    this.importStatus = 'completed';
    if (this.importProgress) {
      this.importProgress.processed = this.importProgress.total;
    }
    this.markAsUpdated();
  }

  /**
   * Mark import as failed
   */
  markImportFailed(error: string): void {
    this.importStatus = 'failed';
    if (this.importProgress) {
      this.importProgress.lastError = error;
    }
    this.markAsUpdated();
  }

  /**
   * Increment favorite count
   */
  incrementFavoriteCount(): void {
    this.favoriteCount++;
    this.markAsUpdated();
  }

  /**
   * Decrement favorite count
   */
  decrementFavoriteCount(): void {
    if (this.favoriteCount > 0) {
      this.favoriteCount--;
      this.markAsUpdated();
    }
  }

  /**
   * Increment study count
   */
  incrementStudyCount(): void {
    this.studyCount++;
    this.markAsUpdated();
  }

  // ===== Getters =====

  getId(): string {
    return this._id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getLanguage(): LanguageVO {
    return this.language;
  }

  getType(): SetTypeVO {
    return this.type;
  }

  getDifficulty(): DifficultyVO | null {
    return this.difficulty;
  }

  getIsPublic(): boolean {
    return this.isPublic;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getTags(): string[] {
    return [...this.tags];
  }

  getCoverImage(): string | null {
    return this.coverImage;
  }

  getUserId(): string {
    return this.userId;
  }

  getEntryCount(): number {
    return this.entryCount;
  }

  getFavoriteCount(): number {
    return this.favoriteCount;
  }

  getStudyCount(): number {
    return this.studyCount;
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

  getVersion(): bigint {
    return this._version;
  }

  getImportStatus(): ImportStatus {
    return this.importStatus;
  }

  getImportProgress(): ImportProgress | null {
    return this.importProgress ? { ...this.importProgress } : null;
  }

  /**
   * Check if user owns this set
   */
  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  /**
   * Convert to persistence format
   */
  toPersistence(): {
    id: string;
    title: string;
    description: string | null;
    language: string;
    type: string;
    difficulty: string | null;
    isPublic: boolean;
    isActive: boolean;
    tags: string[];
    coverImage: string | null;
    userId: string;
    entryCount: number;
    favoriteCount: number;
    studyCount: number;
    importStatus: string;
    importProgress: ImportProgress | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number;
  } {
    return {
      id: this._id,
      title: this.title,
      description: this.description,
      language: this.language.getValue(),
      type: this.type.getValue(),
      difficulty: this.difficulty?.getValue() || null,
      isPublic: this.isPublic,
      isActive: this.isActive,
      tags: this.tags,
      coverImage: this.coverImage,
      userId: this.userId,
      entryCount: this.entryCount,
      favoriteCount: this.favoriteCount,
      studyCount: this.studyCount,
      importStatus: this.importStatus,
      importProgress: this.importProgress,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      deleted: this._deleted,
      version: Number(this._version),
    };
  }

  /**
   * Convert to plain object (required by Entity base class)
   */
  toPlainObject(): Record<string, unknown> {
    return this.toPersistence();
  }
}
