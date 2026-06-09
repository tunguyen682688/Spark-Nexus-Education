import { VocabularySetEntity } from '../entities/vocabulary-set.entity';
import { VocabularySetItemEntity } from '../entities/vocabulary-set-item.entity';
import { EntryEntity } from '../entities/entry.entity';
import { LanguageVO } from '../value-objects/language.vo';
import { SetTypeVO } from '../value-objects/set-type.vo';
import { DifficultyVO } from '../value-objects/difficulty.vo';

/**
 * VocabularySetAggregate
 *
 * Aggregate helper that manages the creation of a vocabulary set
 * along with its initial items (entries).
 *
 * This aggregate ensures:
 * - Atomic creation of set and items
 * - Proper domain event emission
 * - Business rule validation
 *
 * Following DDD principles:
 * - VocabularySetEntity is the Aggregate Root
 * - VocabularySetItemEntity are child entities
 * - This aggregate orchestrates the creation process
 */
export class VocabularySetAggregate {
  private readonly vocabularySet: VocabularySetEntity;
  private readonly items: VocabularySetItemEntity[] = [];

  private constructor(vocabularySet: VocabularySetEntity) {
    this.vocabularySet = vocabularySet;
  }

  /**
   * Create a new VocabularySetAggregate
   * This is the primary factory method
   *
   * @param setId - Unique identifier for the vocabulary set
   * @param title - Title of the vocabulary set (required, max 200 chars)
   * @param description - Optional description of the set
   * @param language - Language value object
   * @param type - Set type value object (flashcard, quiz, etc.)
   * @param userId - ID of the user creating the set
   * @param difficulty - Optional difficulty level value object
   * @param tags - Optional array of tags
   * @param coverImage - Optional cover image URL
   * @returns New VocabularySetAggregate instance
   */
  static create(
    setId: string,
    title: string,
    description: string | null,
    language: LanguageVO,
    type: SetTypeVO,
    userId: string,
    difficulty?: DifficultyVO | null,
    tags?: string[],
    coverImage?: string | null
  ): VocabularySetAggregate {
    const vocabularySet = VocabularySetEntity.create(
      setId,
      title,
      description,
      language,
      type,
      userId,
      difficulty,
      tags
    );

    if (coverImage) {
      vocabularySet.setCoverImage(coverImage);
    }

    return new VocabularySetAggregate(vocabularySet);
  }

  /**
   * Factory method to reconstitute from persistence
   */
  static fromPersistence(
    vocabularySet: VocabularySetEntity,
    items: VocabularySetItemEntity[] = []
  ): VocabularySetAggregate {
    const aggregate = new VocabularySetAggregate(vocabularySet);
    items.forEach((item) => aggregate.items.push(item));
    return aggregate;
  }

  /**
   * Add an entry to the vocabulary set
   * Creates a VocabularySetItem and raises domain event
   *
   * @param itemId - Unique identifier for the vocabulary set item
   * @param entry - Entry entity to add to the set
   * @param position - Optional position/order in the set
   * @param notes - Optional personal notes for this entry
   * @throws Error if entry already exists in the set
   */
  addEntry(
    itemId: string,
    entry: EntryEntity,
    position?: number | null,
    notes?: string | null
  ): void {
    // Business Rule: Check if entry already exists in set
    const existingItem = this.items.find(
      (item) => item.getEntryId() === entry.getId()
    );
    if (existingItem && !existingItem.isDeleted()) {
      throw new Error(
        `Entry ${entry.getWord()} already exists in vocabulary set`
      );
    }

    // Get primary sense definition and example for denormalization
    // Note: In a real implementation, you would fetch senses/examples from repository
    const definition = null; // Will be populated from sense
    const example = null; // Will be populated from example

    const item = VocabularySetItemEntity.create(
      itemId,
      entry.getId(),
      this.vocabularySet.getId(),
      entry.getWord(),
      definition,
      example,
      notes || null,
      position || null
    );

    this.items.push(item);
    this.vocabularySet.incrementEntryCount();

    // Raise domain event through public method
    this.vocabularySet.raiseEntryAddedEvent(entry.getId(), itemId);
  }

  /**
   * Add multiple entries to the vocabulary set
   * Useful for batch operations
   *
   * @param entries - Array of entry data to add
   * @param entries[].itemId - Unique identifier for each vocabulary set item
   * @param entries[].entry - Entry entity to add
   * @param entries[].position - Optional position/order in the set
   * @param entries[].notes - Optional personal notes
   * @param entries[].definition - Optional definition (for denormalization)
   * @param entries[].example - Optional example (for denormalization)
   * @note Duplicate entries are automatically skipped (no error thrown)
   */
  addEntries(
    entries: Array<{
      itemId: string;
      entry: EntryEntity;
      position?: number | null;
      notes?: string | null;
      definition?: string | null;
      example?: string | null;
    }>
  ): void {
    for (const {
      itemId,
      entry,
      position,
      notes,
      definition,
      example,
    } of entries) {
      // Business Rule: Check if entry already exists in set
      const existingItem = this.items.find(
        (item) => item.getEntryId() === entry.getId()
      );
      if (existingItem && !existingItem.isDeleted()) {
        continue; // Skip duplicates
      }

      const item = VocabularySetItemEntity.create(
        itemId,
        entry.getId(),
        this.vocabularySet.getId(),
        entry.getWord(),
        definition || null,
        example || null,
        notes || null,
        position || null
      );

      this.items.push(item);
      this.vocabularySet.incrementEntryCount();

      // Raise domain event through public method
      this.vocabularySet.raiseEntryAddedEvent(entry.getId(), itemId);
    }
  }

  /**
   * Get the vocabulary set entity (Aggregate Root)
   */
  getVocabularySet(): VocabularySetEntity {
    return this.vocabularySet;
  }

  /**
   * Get all items in the aggregate
   */
  getItems(): readonly VocabularySetItemEntity[] {
    return Object.freeze([...this.items]);
  }

  /**
   * Get the count of items
   */
  getItemCount(): number {
    return this.items.length;
  }

  /**
   * Check if aggregate has any items
   */
  hasItems(): boolean {
    return this.items.length > 0;
  }

  /**
   * Get all domain events from the aggregate root
   * @returns Readonly array of domain events
   */
  getDomainEvents() {
    return this.vocabularySet.getDomainEvents();
  }

  /**
   * Clear all domain events
   */
  clearDomainEvents(): void {
    this.vocabularySet.clearDomainEvents();
  }
}
