import { AggregateRoot } from '@spark-nest-ed/shared-libs';
import { LanguageVO } from '../value-objects/language.vo';

/**
 * Domain Entity: Entry (Dictionary Word) - Aggregate Root
 * Represents a dictionary entry (word) with all its metadata
 * Maps to entries table
 *
 * This is an Aggregate Root because:
 * - It has multiple child entities (Sense, Example, Expression, LexicalVariant)
 * - It manages consistency of entry data
 * - It has complex business rules (publishing, uniqueness)
 *
 * Business Rules:
 * - Word must be unique per language
 * - Word cannot be empty
 * - Published entries must have at least one sense
 */
export class EntryEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private readonly word: string,
    private readonly language: LanguageVO,
    private pronunciation: string | null,
    private partOfSpeech: string | null,
    private frequency: number,
    private isDraft: boolean,
    private isPublished: boolean,
    private notes: string | null,
    private sourceUrl: string | null,
    private tags: string[],
    private audioUrl: string | null,
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
   * Factory method to create a new Entry
   */
  static create(
    id: string,
    word: string,
    language: LanguageVO,
    pronunciation?: string | null,
    partOfSpeech?: string | null,
    sourceUrl?: string | null,
    tags?: string[]
  ): EntryEntity {
    // Business Rule: Word must not be empty
    if (!word || word.trim().length === 0) {
      throw new Error('Entry word cannot be empty');
    }

    // Business Rule: Word length validation
    if (word.length > 255) {
      throw new Error('Entry word cannot exceed 255 characters');
    }

    const now = new Date();
    return new EntryEntity(
      id,
      word.trim(),
      language,
      pronunciation || null,
      partOfSpeech || null,
      0, // frequency: default 0
      true, // isDraft: default true
      false, // isPublished: default false
      null, // notes
      sourceUrl || null,
      tags || [],
      null, // audioUrl
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
    word: string;
    language: string;
    pronunciation: string | null;
    partOfSpeech: string | null;
    frequency: number;
    isDraft: boolean;
    isPublished: boolean;
    notes: string | null;
    sourceUrl: string | null;
    tags: string[];
    audioUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number | bigint;
  }): EntryEntity {
    const version =
      typeof data.version === 'bigint' ? data.version : BigInt(data.version);
    return new EntryEntity(
      data.id,
      data.word,
      LanguageVO.create(data.language),
      data.pronunciation,
      data.partOfSpeech,
      data.frequency,
      data.isDraft,
      data.isPublished,
      data.notes,
      data.sourceUrl,
      data.tags,
      data.audioUrl,
      data.createdAt,
      data.updatedAt,
      data.deleted,
      version
    );
  }

  // ===== Business Logic Methods =====

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
   * Increment frequency
   */
  incrementFrequency(): void {
    this.frequency++;
    this.markAsUpdated();
  }

  /**
   * Set frequency
   */
  setFrequency(frequency: number): void {
    if (frequency < 0) {
      throw new Error('Frequency cannot be negative');
    }
    this.frequency = frequency;
    this.markAsUpdated();
  }

  /**
   * Publish the entry
   */
  publish(): void {
    this.isDraft = false;
    this.isPublished = true;
    this.markAsUpdated();
  }

  /**
   * Unpublish the entry
   */
  unpublish(): void {
    this.isPublished = false;
    this.markAsUpdated();
  }

  /**
   * Update notes
   */
  updateNotes(notes: string | null): void {
    this.notes = notes;
    this.markAsUpdated();
  }

  /**
   * Update source URL
   */
  updateSourceUrl(sourceUrl: string | null): void {
    if (sourceUrl && sourceUrl.length > 500) {
      throw new Error('Source URL cannot exceed 500 characters');
    }
    this.sourceUrl = sourceUrl;
    this.markAsUpdated();
  }

  /**
   * Add tags
   */
  addTags(newTags: string[]): void {
    const uniqueTags = new Set([...this.tags, ...newTags]);
    this.tags = Array.from(uniqueTags);
    this.markAsUpdated();
  }

  /**
   * Remove tags
   */
  removeTags(tagsToRemove: string[]): void {
    this.tags = this.tags.filter((tag) => !tagsToRemove.includes(tag));
    this.markAsUpdated();
  }

  /**
   * Set audio URL
   */
  setAudioUrl(audioUrl: string | null): void {
    if (audioUrl && audioUrl.length > 500) {
      throw new Error('Audio URL cannot exceed 500 characters');
    }
    this.audioUrl = audioUrl;
    this.markAsUpdated();
  }

  /**
   * Soft delete the entry
   */
  delete(): void {
    this.markAsDeleted();
    this.isPublished = false;
  }

  // ===== Getters =====

  getId(): string {
    return this._id;
  }

  getWord(): string {
    return this.word;
  }

  getLanguage(): LanguageVO {
    return this.language;
  }

  getPronunciation(): string | null {
    return this.pronunciation;
  }

  getPartOfSpeech(): string | null {
    return this.partOfSpeech;
  }

  getFrequency(): number {
    return this.frequency;
  }

  getIsDraft(): boolean {
    return this.isDraft;
  }

  getIsPublished(): boolean {
    return this.isPublished;
  }

  getNotes(): string | null {
    return this.notes;
  }

  getSourceUrl(): string | null {
    return this.sourceUrl;
  }

  getTags(): string[] {
    return [...this.tags];
  }

  getAudioUrl(): string | null {
    return this.audioUrl;
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
    word: string;
    language: string;
    pronunciation: string | null;
    partOfSpeech: string | null;
    frequency: number;
    isDraft: boolean;
    isPublished: boolean;
    notes: string | null;
    sourceUrl: string | null;
    tags: string[];
    audioUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number;
  } {
    return {
      id: this._id,
      word: this.word,
      language: this.language.getValue(),
      pronunciation: this.pronunciation,
      partOfSpeech: this.partOfSpeech,
      frequency: this.frequency,
      isDraft: this.isDraft,
      isPublished: this.isPublished,
      notes: this.notes,
      sourceUrl: this.sourceUrl,
      tags: this.tags,
      audioUrl: this.audioUrl,
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
