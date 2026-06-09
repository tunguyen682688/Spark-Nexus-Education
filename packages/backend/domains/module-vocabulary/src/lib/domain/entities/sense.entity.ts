import { Entity } from '@spark-nest-ed/shared-libs';
import { LanguageVO } from '../value-objects/language.vo';

/**
 * Domain Entity: Sense
 * Represents a meaning/definition of an entry
 * Maps to senses table
 *
 * Business Rules:
 * - Definition must not be empty
 * - Each entry can have multiple senses
 * - Sense must belong to an entry
 */
export class SenseEntity extends Entity<string> {
  private constructor(
    id: string,
    private readonly entryId: string,
    private definition: string,
    private readonly language: LanguageVO,
    private antonym: string | null,
    private etymologyText: string | null,
    private fieldOfStudy: string | null,
    private level: string | null,
    private note: string | null,
    private partOfSpeech: string | null,
    private seeAlso: string | null,
    private synonym: string | null,
    private topic: string | null,
    private usage: string | null,
    private images: string[],
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
   * Factory method to create a new Sense
   */
  static create(
    id: string,
    entryId: string,
    definition: string,
    language: LanguageVO,
    partOfSpeech?: string | null,
    level?: string | null,
    topic?: string | null
  ): SenseEntity {
    // Business Rule: Definition must not be empty
    if (!definition || definition.trim().length === 0) {
      throw new Error('Sense definition cannot be empty');
    }

    const now = new Date();
    return new SenseEntity(
      id,
      entryId,
      definition.trim(),
      language,
      null, // antonym
      null, // etymologyText
      null, // fieldOfStudy
      level || null,
      null, // note
      partOfSpeech || null,
      null, // seeAlso
      null, // synonym
      topic || null,
      null, // usage
      [], // images
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
    definition: string;
    language: string;
    antonym: string | null;
    etymologyText: string | null;
    fieldOfStudy: string | null;
    level: string | null;
    note: string | null;
    partOfSpeech: string | null;
    seeAlso: string | null;
    synonym: string | null;
    topic: string | null;
    usage: string | null;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number | bigint;
  }): SenseEntity {
    const version =
      typeof data.version === 'bigint' ? data.version : BigInt(data.version);
    return new SenseEntity(
      data.id,
      data.entryId,
      data.definition,
      LanguageVO.create(data.language),
      data.antonym,
      data.etymologyText,
      data.fieldOfStudy,
      data.level,
      data.note,
      data.partOfSpeech,
      data.seeAlso,
      data.synonym,
      data.topic,
      data.usage,
      data.images,
      data.createdAt,
      data.updatedAt,
      data.deleted,
      version
    );
  }

  // ===== Business Logic Methods =====

  /**
   * Update definition
   */
  updateDefinition(definition: string): void {
    if (!definition || definition.trim().length === 0) {
      throw new Error('Sense definition cannot be empty');
    }
    this.definition = definition.trim();
    this.markAsUpdated();
  }

  /**
   * Update antonym
   */
  updateAntonym(antonym: string | null): void {
    if (antonym && antonym.length > 255) {
      throw new Error('Antonym cannot exceed 255 characters');
    }
    this.antonym = antonym;
    this.markAsUpdated();
  }

  /**
   * Update etymology text
   */
  updateEtymologyText(etymologyText: string | null): void {
    this.etymologyText = etymologyText;
    this.markAsUpdated();
  }

  /**
   * Update field of study
   */
  updateFieldOfStudy(fieldOfStudy: string | null): void {
    if (fieldOfStudy && fieldOfStudy.length > 100) {
      throw new Error('Field of study cannot exceed 100 characters');
    }
    this.fieldOfStudy = fieldOfStudy;
    this.markAsUpdated();
  }

  /**
   * Update level
   */
  updateLevel(level: string | null): void {
    if (level && level.length > 50) {
      throw new Error('Level cannot exceed 50 characters');
    }
    this.level = level;
    this.markAsUpdated();
  }

  /**
   * Update note
   */
  updateNote(note: string | null): void {
    this.note = note;
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
   * Update see also
   */
  updateSeeAlso(seeAlso: string | null): void {
    if (seeAlso && seeAlso.length > 255) {
      throw new Error('See also cannot exceed 255 characters');
    }
    this.seeAlso = seeAlso;
    this.markAsUpdated();
  }

  /**
   * Update synonym
   */
  updateSynonym(synonym: string | null): void {
    if (synonym && synonym.length > 255) {
      throw new Error('Synonym cannot exceed 255 characters');
    }
    this.synonym = synonym;
    this.markAsUpdated();
  }

  /**
   * Update topic
   */
  updateTopic(topic: string | null): void {
    if (topic && topic.length > 100) {
      throw new Error('Topic cannot exceed 100 characters');
    }
    this.topic = topic;
    this.markAsUpdated();
  }

  /**
   * Update usage
   */
  updateUsage(usage: string | null): void {
    this.usage = usage;
    this.markAsUpdated();
  }

  /**
   * Add images
   */
  addImages(newImages: string[]): void {
    const uniqueImages = new Set([...this.images, ...newImages]);
    this.images = Array.from(uniqueImages);
    this.markAsUpdated();
  }

  /**
   * Remove images
   */
  removeImages(imagesToRemove: string[]): void {
    this.images = this.images.filter((img) => !imagesToRemove.includes(img));
    this.markAsUpdated();
  }

  /**
   * Soft delete the sense
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

  getDefinition(): string {
    return this.definition;
  }

  getLanguage(): LanguageVO {
    return this.language;
  }

  getAntonym(): string | null {
    return this.antonym;
  }

  getEtymologyText(): string | null {
    return this.etymologyText;
  }

  getFieldOfStudy(): string | null {
    return this.fieldOfStudy;
  }

  getLevel(): string | null {
    return this.level;
  }

  getNote(): string | null {
    return this.note;
  }

  getPartOfSpeech(): string | null {
    return this.partOfSpeech;
  }

  getSeeAlso(): string | null {
    return this.seeAlso;
  }

  getSynonym(): string | null {
    return this.synonym;
  }

  getTopic(): string | null {
    return this.topic;
  }

  getUsage(): string | null {
    return this.usage;
  }

  getImages(): string[] {
    return [...this.images];
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
    definition: string;
    language: string;
    antonym: string | null;
    etymologyText: string | null;
    fieldOfStudy: string | null;
    level: string | null;
    note: string | null;
    partOfSpeech: string | null;
    seeAlso: string | null;
    synonym: string | null;
    topic: string | null;
    usage: string | null;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number;
  } {
    return {
      id: this._id,
      entryId: this.entryId,
      definition: this.definition,
      language: this.language.getValue(),
      antonym: this.antonym,
      etymologyText: this.etymologyText,
      fieldOfStudy: this.fieldOfStudy,
      level: this.level,
      note: this.note,
      partOfSpeech: this.partOfSpeech,
      seeAlso: this.seeAlso,
      synonym: this.synonym,
      topic: this.topic,
      usage: this.usage,
      images: this.images,
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
