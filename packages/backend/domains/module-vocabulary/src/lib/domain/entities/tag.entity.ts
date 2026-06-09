import { Entity } from '@spark-nest-ed/shared-libs';

/**
 * Domain Entity: Tag
 * Represents a tag for categorizing vocabulary items
 * Maps to tags table
 *
 * Business Rules:
 * - Tag name must be unique
 * - Tag name must not be empty
 * - Tag name max length: 100 characters
 */
export class TagEntity extends Entity<string> {
  private constructor(
    id: string,
    private name: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt, BigInt(1));
  }

  /**
   * Factory method to create a new Tag
   */
  static create(id: string, name: string): TagEntity {
    // Business Rule: Tag name must not be empty
    if (!name || name.trim().length === 0) {
      throw new Error('Tag name cannot be empty');
    }

    // Business Rule: Tag name length validation
    if (name.length > 100) {
      throw new Error('Tag name cannot exceed 100 characters');
    }

    const now = new Date();
    return new TagEntity(id, name.trim(), now, now);
  }

  /**
   * Factory method to reconstitute from database
   */
  static fromPersistence(data: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): TagEntity {
    return new TagEntity(data.id, data.name, data.createdAt, data.updatedAt);
  }

  // ===== Business Logic Methods =====

  /**
   * Update tag name
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Tag name cannot be empty');
    }
    if (name.length > 100) {
      throw new Error('Tag name cannot exceed 100 characters');
    }
    this.name = name.trim();
    this.markAsUpdated();
  }

  // ===== Getters =====

  getId(): string {
    return this._id;
  }

  getName(): string {
    return this.name;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Convert to persistence format
   */
  toPersistence(): {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      name: this.name,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Convert to plain object (required by Entity base class)
   */
  toPlainObject(): Record<string, unknown> {
    return this.toPersistence();
  }
}
