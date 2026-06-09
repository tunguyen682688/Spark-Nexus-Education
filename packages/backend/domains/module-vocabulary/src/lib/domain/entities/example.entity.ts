import { Entity } from '@spark-nest-ed/shared-libs';
import { LanguageVO } from '../value-objects/language.vo';

/**
 * Domain Entity: Example
 * Represents an example sentence for an entry or sense
 * Maps to examples table
 *
 * Business Rules:
 * - Example text must not be empty
 * - Example must belong to either an entry or a sense (or both)
 */
export class ExampleEntity extends Entity<string> {
  private constructor(
    id: string,
    private entryId: string | null,
    private senseId: string | null,
    private exampleText: string,
    private translation: string | null,
    private readonly language: LanguageVO,
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
   * Factory method to create a new Example
   */
  static create(
    id: string,
    exampleText: string,
    language: LanguageVO,
    entryId?: string | null,
    senseId?: string | null,
    translation?: string | null
  ): ExampleEntity {
    // Business Rule: Example text must not be empty
    if (!exampleText || exampleText.trim().length === 0) {
      throw new Error('Example text cannot be empty');
    }

    // Business Rule: Must belong to either entry or sense
    if (!entryId && !senseId) {
      throw new Error('Example must belong to either an entry or a sense');
    }

    const now = new Date();
    return new ExampleEntity(
      id,
      entryId || null,
      senseId || null,
      exampleText.trim(),
      translation || null,
      language,
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
    entryId: string | null;
    senseId: string | null;
    exampleText: string;
    translation: string | null;
    language: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number | bigint;
  }): ExampleEntity {
    const version =
      typeof data.version === 'bigint' ? data.version : BigInt(data.version);
    return new ExampleEntity(
      data.id,
      data.entryId,
      data.senseId,
      data.exampleText,
      data.translation,
      LanguageVO.create(data.language),
      data.createdAt,
      data.updatedAt,
      data.deleted,
      version
    );
  }

  // ===== Business Logic Methods =====

  /**
   * Update example text
   */
  updateExampleText(exampleText: string): void {
    if (!exampleText || exampleText.trim().length === 0) {
      throw new Error('Example text cannot be empty');
    }
    this.exampleText = exampleText.trim();
    this.markAsUpdated();
  }

  /**
   * Update translation
   */
  updateTranslation(translation: string | null): void {
    this.translation = translation;
    this.markAsUpdated();
  }

  /**
   * Update entry ID (for moving example between entries)
   */
  updateEntryId(entryId: string | null): void {
    // Business Rule: Must belong to either entry or sense
    if (!entryId && !this.senseId) {
      throw new Error('Example must belong to either an entry or a sense');
    }
    this.entryId = entryId;
    this.markAsUpdated();
  }

  /**
   * Update sense ID (for moving example between senses)
   */
  updateSenseId(senseId: string | null): void {
    // Business Rule: Must belong to either entry or sense
    if (!this.entryId && !senseId) {
      throw new Error('Example must belong to either an entry or a sense');
    }
    this.senseId = senseId;
    this.markAsUpdated();
  }

  /**
   * Soft delete the example
   */
  delete(): void {
    this.markAsDeleted();
  }

  // ===== Getters =====

  getId(): string {
    return this._id;
  }

  getEntryId(): string | null {
    return this.entryId;
  }

  getSenseId(): string | null {
    return this.senseId;
  }

  getExampleText(): string {
    return this.exampleText;
  }

  getTranslation(): string | null {
    return this.translation;
  }

  getLanguage(): LanguageVO {
    return this.language;
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
    entryId: string | null;
    senseId: string | null;
    exampleText: string;
    translation: string | null;
    language: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number;
  } {
    return {
      id: this._id,
      entryId: this.entryId,
      senseId: this.senseId,
      exampleText: this.exampleText,
      translation: this.translation,
      language: this.language.getValue(),
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
