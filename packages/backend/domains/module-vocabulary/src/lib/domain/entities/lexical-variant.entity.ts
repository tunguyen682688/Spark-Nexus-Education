import { Entity } from '@spark-nest-ed/shared-libs';

/**
 * Domain Entity: LexicalVariant
 * Represents a lexical variant of an entry (e.g., plural form, different spelling)
 * Maps to lexical_variants table
 *
 * Business Rules:
 * - Variant must belong to an entry
 * - Used for word forms and variations
 */
export class LexicalVariantEntity extends Entity<string> {
  private constructor(
    id: string,
    private readonly entryId: string,
    private notes: string | null,
    private partOfSpeech: string | null,
    private pronunciation: string | null,
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
   * Factory method to create a new LexicalVariant
   */
  static create(
    id: string,
    entryId: string,
    partOfSpeech?: string | null,
    pronunciation?: string | null,
    notes?: string | null
  ): LexicalVariantEntity {
    const now = new Date();
    return new LexicalVariantEntity(
      id,
      entryId,
      notes || null,
      partOfSpeech || null,
      pronunciation || null,
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
    notes: string | null;
    partOfSpeech: string | null;
    pronunciation: string | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number | bigint;
  }): LexicalVariantEntity {
    const version =
      typeof data.version === 'bigint' ? data.version : BigInt(data.version);
    return new LexicalVariantEntity(
      data.id,
      data.entryId,
      data.notes,
      data.partOfSpeech,
      data.pronunciation,
      data.createdAt,
      data.updatedAt,
      data.deleted,
      version
    );
  }

  // ===== Business Logic Methods =====

  /**
   * Update notes
   */
  updateNotes(notes: string | null): void {
    this.notes = notes;
    this.markAsUpdated();
  }

  /**
   * Update part of speech
   */
  updatePartOfSpeech(partOfSpeech: string | null): void {
    if (partOfSpeech && partOfSpeech.length > 50) {
      throw new Error('Part of speech cannot exceed 50 characters');
    }
    this.partOfSpeech = partOfSpeech;
    this.markAsUpdated();
  }

  /**
   * Update pronunciation
   */
  updatePronunciation(pronunciation: string | null): void {
    if (pronunciation && pronunciation.length > 100) {
      throw new Error('Pronunciation cannot exceed 100 characters');
    }
    this.pronunciation = pronunciation;
    this.markAsUpdated();
  }

  /**
   * Soft delete the variant
   */
  delete(): void {
    this.markAsDeleted();
  }

  // ===== Getters =====

  getId(): string {
    return this._id;
  }

  getEntryId(): string {
    return this.entryId;
  }

  getNotes(): string | null {
    return this.notes;
  }

  getPartOfSpeech(): string | null {
    return this.partOfSpeech;
  }

  getPronunciation(): string | null {
    return this.pronunciation;
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
    notes: string | null;
    partOfSpeech: string | null;
    pronunciation: string | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number;
  } {
    return {
      id: this._id,
      entryId: this.entryId,
      notes: this.notes,
      partOfSpeech: this.partOfSpeech,
      pronunciation: this.pronunciation,
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
