import { EntryEntity } from '../entities/entry.entity';
import { SenseEntity } from '../entities/sense.entity';
import { ExampleEntity } from '../entities/example.entity';
import { ExpressionEntity } from '../entities/expression.entity';
import { ExpressionMeaningEntity } from '../entities/expression-meaning.entity';
import { LexicalVariantEntity } from '../entities/lexical-variant.entity';
import { LanguageVO } from '../value-objects/language.vo';

/**
 * EntryAggregate
 *
 * Aggregate that manages a dictionary entry (word) along with all its related content:
 * - Senses (meanings/definitions)
 * - Examples (usage examples)
 * - Expressions (phrases/idioms)
 * - Expression Meanings
 * - Lexical Variants (word forms)
 *
 * Following DDD principles:
 * - EntryEntity is the Aggregate Root
 * - Sense, Example, Expression, LexicalVariant are child entities
 * - This aggregate ensures consistency of entry data
 *
 * Business Rules:
 * - Entry must have at least one sense to be published
 * - Entry word must be unique per language
 * - All child entities must belong to the entry
 */
export class EntryAggregate {
  private readonly entry: EntryEntity;
  private readonly senses: SenseEntity[] = [];
  private readonly examples: ExampleEntity[] = [];
  private readonly expressions: ExpressionEntity[] = [];
  private readonly expressionMeanings: ExpressionMeaningEntity[] = [];
  private readonly lexicalVariants: LexicalVariantEntity[] = [];

  private constructor(entry: EntryEntity) {
    this.entry = entry;
  }

  /**
   * Create a new EntryAggregate
   * This is the primary factory method
   */
  static create(
    entryId: string,
    word: string,
    language: LanguageVO,
    pronunciation?: string | null,
    partOfSpeech?: string | null,
    sourceUrl?: string | null,
    tags?: string[]
  ): EntryAggregate {
    const entry = EntryEntity.create(
      entryId,
      word,
      language,
      pronunciation,
      partOfSpeech,
      sourceUrl,
      tags
    );

    return new EntryAggregate(entry);
  }

  /**
   * Factory method to reconstitute from database
   */
  static fromPersistence(
    entry: EntryEntity,
    senses: SenseEntity[] = [],
    examples: ExampleEntity[] = [],
    expressions: ExpressionEntity[] = [],
    expressionMeanings: ExpressionMeaningEntity[] = [],
    lexicalVariants: LexicalVariantEntity[] = []
  ): EntryAggregate {
    const aggregate = new EntryAggregate(entry);

    // Add child entities
    senses.forEach((sense) => aggregate.senses.push(sense));
    examples.forEach((example) => aggregate.examples.push(example));
    expressions.forEach((expression) => aggregate.expressions.push(expression));
    expressionMeanings.forEach((meaning) =>
      aggregate.expressionMeanings.push(meaning)
    );
    lexicalVariants.forEach((variant) =>
      aggregate.lexicalVariants.push(variant)
    );

    return aggregate;
  }

  // ===== Sense Management =====

  /**
   * Add a sense (meaning/definition) to the entry
   */
  addSense(
    senseId: string,
    definition: string,
    language: LanguageVO,
    partOfSpeech?: string | null,
    level?: string | null,
    topic?: string | null
  ): void {
    const sense = SenseEntity.create(
      senseId,
      this.entry.getId(),
      definition,
      language,
      partOfSpeech,
      level,
      topic
    );

    this.senses.push(sense);
    // Entry will be marked as updated when sense is persisted
  }

  /**
   * Remove a sense (soft delete)
   */
  removeSense(senseId: string): void {
    const sense = this.senses.find((s) => s.getId() === senseId);
    if (sense) {
      sense.delete();
      // Entry will be marked as updated when sense deletion is persisted
    }
  }

  /**
   * Get primary sense (first non-deleted sense)
   */
  getPrimarySense(): SenseEntity | null {
    return this.senses.find((s) => !s.isDeleted()) || null;
  }

  // ===== Example Management =====

  /**
   * Add an example to the entry or a specific sense
   */
  addExample(
    exampleId: string,
    exampleText: string,
    language: LanguageVO,
    senseId?: string | null,
    translation?: string | null
  ): void {
    const example = ExampleEntity.create(
      exampleId,
      exampleText,
      language,
      this.entry.getId(),
      senseId || null,
      translation
    );

    this.examples.push(example);
    // Entry will be marked as updated when example is persisted
  }

  /**
   * Remove an example (soft delete)
   */
  removeExample(exampleId: string): void {
    const example = this.examples.find((e) => e.getId() === exampleId);
    if (example) {
      example.delete();
      // Entry will be marked as updated when example deletion is persisted
    }
  }

  // ===== Expression Management =====

  /**
   * Add an expression (phrase/idiom) to the entry
   */
  addExpression(
    expressionId: string,
    expression: string,
    language: LanguageVO
  ): void {
    const expr = ExpressionEntity.create(
      expressionId,
      this.entry.getId(),
      expression,
      language
    );

    this.expressions.push(expr);
    // Entry will be marked as updated when expression is persisted
  }

  /**
   * Add a meaning to an expression
   *
   * @param meaningId - Unique identifier for the meaning
   * @param expressionId - ID of the expression this meaning belongs to
   * @param meaningText - The meaning text
   * @param meaningOrder - Order of the meaning (default: 1)
   * @param entryId - Optional cross-reference to another entry
   * @param usageNotes - Optional usage notes
   * @throws Error if expression not found in this aggregate
   */
  addExpressionMeaning(
    meaningId: string,
    expressionId: string,
    meaningText: string,
    meaningOrder = 1,
    entryId?: string | null,
    usageNotes?: string | null
  ): void {
    // Find the expression
    const expression = this.expressions.find((e) => e.getId() === expressionId);
    if (!expression) {
      throw new Error(`Expression ${expressionId} not found in this aggregate`);
    }

    // Validate that expression belongs to this entry
    if (expression.getEntryId() !== this.entry.getId()) {
      throw new Error(
        `Expression ${expressionId} does not belong to this entry`
      );
    }

    // Use entry ID if not provided
    const finalEntryId = entryId ?? this.entry.getId();

    const meaning = ExpressionMeaningEntity.create(
      meaningId,
      expressionId,
      meaningText,
      meaningOrder,
      finalEntryId,
      usageNotes
    );

    this.expressionMeanings.push(meaning);
    // Entry will be marked as updated when meaning is persisted
  }

  /**
   * Remove an expression meaning (soft delete)
   */
  removeExpressionMeaning(meaningId: string): void {
    const meaning = this.expressionMeanings.find(
      (m) => m.getId() === meaningId
    );
    if (meaning) {
      meaning.delete();
      // Entry will be marked as updated when meaning deletion is persisted
    }
  }

  /**
   * Get meanings for a specific expression
   */
  getExpressionMeanings(
    expressionId: string
  ): readonly ExpressionMeaningEntity[] {
    return Object.freeze(
      this.expressionMeanings.filter(
        (m) => m.getExpressionId() === expressionId && !m.isDeleted()
      )
    );
  }

  /**
   * Remove an expression (soft delete)
   */
  removeExpression(expressionId: string): void {
    const expression = this.expressions.find((e) => e.getId() === expressionId);
    if (expression) {
      expression.delete();
      // Entry will be marked as updated when expression deletion is persisted
    }
  }

  // ===== Lexical Variant Management =====

  /**
   * Add a lexical variant to the entry
   */
  addLexicalVariant(
    variantId: string,
    partOfSpeech?: string | null,
    pronunciation?: string | null,
    notes?: string | null
  ): void {
    const variant = LexicalVariantEntity.create(
      variantId,
      this.entry.getId(),
      partOfSpeech,
      pronunciation,
      notes
    );

    this.lexicalVariants.push(variant);
    // Entry will be marked as updated when variant is persisted
  }

  /**
   * Remove a lexical variant (soft delete)
   */
  removeLexicalVariant(variantId: string): void {
    const variant = this.lexicalVariants.find((v) => v.getId() === variantId);
    if (variant) {
      variant.delete();
      // Entry will be marked as updated when variant deletion is persisted
    }
  }

  // ===== Business Logic =====

  /**
   * Check if entry can be published
   * Business Rule: Entry must have at least one sense to be published
   */
  canBePublished(): { canPublish: boolean; reason?: string } {
    const activeSenses = this.senses.filter((s) => !s.isDeleted());

    if (activeSenses.length === 0) {
      return {
        canPublish: false,
        reason:
          'Entry must have at least one sense (definition) to be published',
      };
    }

    return { canPublish: true };
  }

  /**
   * Publish the entry
   */
  publish(): void {
    const validation = this.canBePublished();
    if (!validation.canPublish) {
      throw new Error(`Cannot publish entry: ${validation.reason}`);
    }

    this.entry.publish();
  }

  /**
   * Get entry entity (Aggregate Root)
   */
  getEntry(): EntryEntity {
    return this.entry;
  }

  /**
   * Get all senses
   */
  getSenses(): readonly SenseEntity[] {
    return Object.freeze([...this.senses]);
  }

  /**
   * Get all examples
   */
  getExamples(): readonly ExampleEntity[] {
    return Object.freeze([...this.examples]);
  }

  /**
   * Get all expressions
   */
  getExpressions(): readonly ExpressionEntity[] {
    return Object.freeze([...this.expressions]);
  }

  /**
   * Get all expression meanings (for all expressions)
   */
  getAllExpressionMeanings(): readonly ExpressionMeaningEntity[] {
    return Object.freeze([...this.expressionMeanings]);
  }

  /**
   * Get all lexical variants
   */
  getLexicalVariants(): readonly LexicalVariantEntity[] {
    return Object.freeze([...this.lexicalVariants]);
  }

  /**
   * Get primary definition (from first sense)
   */
  getPrimaryDefinition(): string | null {
    const primarySense = this.getPrimarySense();
    return primarySense?.getDefinition() || null;
  }

  /**
   * Get primary example (from first example)
   */
  getPrimaryExample(): string | null {
    const primaryExample = this.examples.find((e) => !e.isDeleted());
    return primaryExample?.getExampleText() || null;
  }
}
