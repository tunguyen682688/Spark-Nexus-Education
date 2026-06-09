import { Entity } from '@spark-nest-ed/shared-libs';

/**
 * Domain Entity: VocabularySetItem
 * Represents the relationship between a vocabulary set and an entry (word)
 * Maps to vocabulary_set_items table
 *
 * Business Rules:
 * - Each entry can only appear once in a set
 * - Items have a position for ordering
 * - Items can have personal notes
 */
export class VocabularySetItemEntity extends Entity<string> {
  private constructor(
    id: string,
    private readonly entryId: string,
    private readonly vocabularySetId: string,
    private word: string,
    private definition: string | null,
    private example: string | null,
    private notes: string | null,
    private position: number | null,
    private readonly addedAt: Date,
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
   * Factory method to create a new VocabularySetItem
   */
  static create(
    id: string,
    entryId: string,
    vocabularySetId: string,
    word: string,
    definition?: string | null,
    example?: string | null,
    notes?: string | null,
    position?: number | null
  ): VocabularySetItemEntity {
    const now = new Date();
    return new VocabularySetItemEntity(
      id,
      entryId,
      vocabularySetId,
      word,
      definition || null,
      example || null,
      notes || null,
      position || null,
      now,
      now,
      now,
      false,
      BigInt(1)
    );
  }

  /**
   * Factory method to reconstitute from database
   */
  static fromPersistence(data: {
    id: string;
    entryId: string;
    vocabularySetId: string;
    word: string;
    definition: string | null;
    example: string | null;
    notes: string | null;
    position: number | null;
    addedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number | bigint;
  }): VocabularySetItemEntity {
    const version =
      typeof data.version === 'bigint' ? data.version : BigInt(data.version);
    return new VocabularySetItemEntity(
      data.id,
      data.entryId,
      data.vocabularySetId,
      data.word,
      data.definition,
      data.example,
      data.notes,
      data.position,
      data.addedAt,
      data.createdAt,
      data.updatedAt,
      data.deleted,
      version
    );
  }

  // ===== Business Logic Methods =====

  /**
   * Update personal notes for this item
   */
  updateNotes(notes: string | null): void {
    this.notes = notes;
    this.markAsUpdated();
  }

  /**
   * Update definition and example for this item
   */
  updateContent(
    definition?: string | null,
    example?: string | null,
    notes?: string | null
  ): void {
    if (definition !== undefined) {
      this.definition = definition;
    }
    if (example !== undefined) {
      this.example = example;
    }
    if (notes !== undefined) {
      this.notes = notes;
    }
    this.markAsUpdated();
  }

  /**
   * Update all word data (word text, definition, example, notes)
   */
  updateWordData(data: {
    word?: string;
    definition?: string | null;
    example?: string | null;
    notes?: string | null;
  }): void {
    if (data.word !== undefined && data.word.trim()) {
      this.word = data.word.trim();
    }
    if (data.definition !== undefined) {
      this.definition = data.definition;
    }
    if (data.example !== undefined) {
      this.example = data.example;
    }
    if (data.notes !== undefined) {
      this.notes = data.notes;
    }
    this.markAsUpdated();
  }

  /**
   * Update position in the set
   */
  updatePosition(position: number): void {
    if (position < 0) {
      throw new Error('Position cannot be negative');
    }
    this.position = position;
    this.markAsUpdated();
  }

  /**
   * Soft delete the item
   */
  delete(): void {
    this.markAsDeleted();
  }

  /**
   * Restore the item (undo soft delete)
   */
  restore(): void {
    this._deleted = false;
    this.markAsUpdated();
  }

  // ===== Getters =====

  getId(): string {
    return this._id;
  }

  getEntryId(): string {
    return this.entryId;
  }

  getVocabularySetId(): string {
    return this.vocabularySetId;
  }

  getWord(): string {
    return this.word;
  }

  getDefinition(): string | null {
    return this.definition;
  }

  getExample(): string | null {
    return this.example;
  }

  getNotes(): string | null {
    return this.notes;
  }

  getPosition(): number | null {
    return this.position;
  }

  getAddedAt(): Date {
    return this.addedAt;
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

  /**
   * Convert to persistence format
   */
  toPersistence(): {
    id: string;
    entryId: string;
    vocabularySetId: string;
    word: string;
    definition: string | null;
    example: string | null;
    notes: string | null;
    position: number | null;
    addedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number;
  } {
    return {
      id: this._id,
      entryId: this.entryId,
      vocabularySetId: this.vocabularySetId,
      word: this.word,
      definition: this.definition,
      example: this.example,
      notes: this.notes,
      position: this.position,
      addedAt: this.addedAt,
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
