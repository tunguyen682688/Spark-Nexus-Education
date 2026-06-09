import { Entity } from '@spark-nest-ed/shared-libs';

/**
 * Domain Entity: ExpressionMeaning
 * Represents a meaning/definition of an expression (phrase/idiom)
 * Maps to expression_meanings table
 *
 * Business Rules:
 * - Meaning text must not be empty
 * - Meaning order must be positive
 * - Expression can have multiple meanings
 */
export class ExpressionMeaningEntity extends Entity<string> {
  private constructor(
    id: string,
    private readonly expressionId: string,
    private entryId: string | null,
    private meaningOrder: number,
    private meaningText: string,
    private usageNotes: string | null,
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
   * Factory method to create a new ExpressionMeaning
   */
  static create(
    id: string,
    expressionId: string,
    meaningText: string,
    meaningOrder: number = 1,
    entryId?: string | null,
    usageNotes?: string | null
  ): ExpressionMeaningEntity {
    // Business Rule: Meaning text must not be empty
    if (!meaningText || meaningText.trim().length === 0) {
      throw new Error('Meaning text cannot be empty');
    }

    // Business Rule: Meaning order must be positive
    if (meaningOrder < 1) {
      throw new Error('Meaning order must be at least 1');
    }

    const now = new Date();
    return new ExpressionMeaningEntity(
      id,
      expressionId,
      entryId || null,
      meaningOrder,
      meaningText.trim(),
      usageNotes || null,
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
    expressionId: string;
    entryId: string | null;
    meaningOrder: number;
    meaningText: string;
    usageNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number | bigint;
  }): ExpressionMeaningEntity {
    const version =
      typeof data.version === 'bigint' ? data.version : BigInt(data.version);
    return new ExpressionMeaningEntity(
      data.id,
      data.expressionId,
      data.entryId,
      data.meaningOrder,
      data.meaningText,
      data.usageNotes,
      data.createdAt,
      data.updatedAt,
      data.deleted,
      version
    );
  }

  // ===== Business Logic Methods =====

  /**
   * Update meaning text
   */
  updateMeaningText(meaningText: string): void {
    if (!meaningText || meaningText.trim().length === 0) {
      throw new Error('Meaning text cannot be empty');
    }
    this.meaningText = meaningText.trim();
    this.markAsUpdated();
  }

  /**
   * Update meaning order
   */
  updateMeaningOrder(order: number): void {
    if (order < 1) {
      throw new Error('Meaning order must be at least 1');
    }
    this.meaningOrder = order;
    this.markAsUpdated();
  }

  /**
   * Update usage notes
   */
  updateUsageNotes(usageNotes: string | null): void {
    this.usageNotes = usageNotes;
    this.markAsUpdated();
  }

  /**
   * Update entry ID (cross-reference)
   */
  updateEntryId(entryId: string | null): void {
    this.entryId = entryId;
    this.markAsUpdated();
  }

  /**
   * Soft delete the meaning
   */
  delete(): void {
    this.markAsDeleted();
  }

  // ===== Getters =====

  getId(): string {
    return this._id;
  }

  getExpressionId(): string {
    return this.expressionId;
  }

  getEntryId(): string | null {
    return this.entryId;
  }

  getMeaningOrder(): number {
    return this.meaningOrder;
  }

  getMeaningText(): string {
    return this.meaningText;
  }

  getUsageNotes(): string | null {
    return this.usageNotes;
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
    expressionId: string;
    entryId: string | null;
    meaningOrder: number;
    meaningText: string;
    usageNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number;
  } {
    return {
      id: this._id,
      expressionId: this.expressionId,
      entryId: this.entryId,
      meaningOrder: this.meaningOrder,
      meaningText: this.meaningText,
      usageNotes: this.usageNotes,
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
