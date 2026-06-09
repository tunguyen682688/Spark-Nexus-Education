import { Entity } from '@spark-nest-ed/shared-libs';
import { LanguageVO } from '../value-objects/language.vo';

/**
 * Domain Entity: Expression
 * Represents a phrase/idiom related to an entry
 * Maps to expressions table
 *
 * Business Rules:
 * - Expression text must not be empty
 * - Expression must belong to an entry
 */
export class ExpressionEntity extends Entity<string> {
  private constructor(
    id: string,
    private readonly entryId: string,
    private expression: string,
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
   * Factory method to create a new Expression
   */
  static create(
    id: string,
    entryId: string,
    expression: string,
    language: LanguageVO
  ): ExpressionEntity {
    // Business Rule: Expression text must not be empty
    if (!expression || expression.trim().length === 0) {
      throw new Error('Expression text cannot be empty');
    }

    const now = new Date();
    return new ExpressionEntity(
      id,
      entryId,
      expression.trim(),
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
    entryId: string;
    expression: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number | bigint;
  }): ExpressionEntity {
    const version =
      typeof data.version === 'bigint' ? data.version : BigInt(data.version);
    return new ExpressionEntity(
      data.id,
      data.entryId,
      data.expression,
      LanguageVO.create(data.language),
      data.createdAt,
      data.updatedAt,
      data.deleted,
      version
    );
  }

  // ===== Business Logic Methods =====

  /**
   * Update expression text
   */
  updateExpression(expression: string): void {
    if (!expression || expression.trim().length === 0) {
      throw new Error('Expression text cannot be empty');
    }
    this.expression = expression.trim();
    this.markAsUpdated();
  }

  /**
   * Soft delete the expression
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

  getExpression(): string {
    return this.expression;
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
    entryId: string;
    expression: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: number;
  } {
    return {
      id: this._id,
      entryId: this.entryId,
      expression: this.expression,
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
