// shared/domain/entity.base.ts

export abstract class Entity<TId = string> {
  protected readonly _id: TId;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _deleted: boolean;
  protected _version: bigint;

  constructor(id: TId, createdAt?: Date, updatedAt?: Date, version?: bigint) {
    this._id = id;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
    this._deleted = false;
    this._version = version || BigInt(1);
  }

  // Identity
  get id(): TId {
    return this._id;
  }

  // Audit fields
  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deleted(): boolean {
    return this._deleted;
  }

  get version(): bigint {
    return this._version;
  }

  // Protected mutators
  protected markAsUpdated(): void {
    this._updatedAt = new Date();
  }

  protected markAsDeleted(): void {
    this._deleted = true;
    this.markAsUpdated();
  }

  protected incrementVersion(): void {
    this._version = this._version + BigInt(1);
  }

  // Equality
  public equals(other?: Entity<TId>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (!(other instanceof Entity)) {
      return false;
    }
    return this._id === other._id;
  }

  // For persistence
  public abstract toPlainObject(): unknown;
}
