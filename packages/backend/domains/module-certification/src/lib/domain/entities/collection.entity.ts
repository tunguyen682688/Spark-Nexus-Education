import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class CollectionEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private title: string,
    private description: string | null,
    private ownerId: string,
    private publishStatus: string,
    private createdBy: string | null,
    private updatedBy: string | null,
    private deletedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    version: bigint,
    private examCount = 0,
    private itemCount = 0
  ) {
    super(id, createdAt, updatedAt, version);
  }

  static create(params: {
    id: string;
    title: string;
    description?: string | null;
    ownerId: string;
    publishStatus?: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    deletedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    version?: bigint;
    examCount?: number;
    itemCount?: number;
  }): CollectionEntity {
    const now = new Date();
    return new CollectionEntity(
      params.id,
      params.title,
      params.description ?? null,
      params.ownerId,
      params.publishStatus ?? 'draft',
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.deletedAt ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.version ?? BigInt(1),
      params.examCount ?? 0,
      params.itemCount ?? 0
    );
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getOwnerId(): string {
    return this.ownerId;
  }

  getPublishStatus(): string {
    return this.publishStatus;
  }

  getCreatedBy(): string | null {
    return this.createdBy;
  }

  getUpdatedBy(): string | null {
    return this.updatedBy;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  getExamCount(): number {
    return this.examCount;
  }

  getItemCount(): number {
    return this.itemCount;
  }

  update(params: {
    title?: string;
    description?: string | null;
    publishStatus?: string;
    updatedBy?: string | null;
  }): void {
    if (params.title !== undefined) this.title = params.title;
    if (params.description !== undefined) this.description = params.description;
    if (params.publishStatus !== undefined) this.publishStatus = params.publishStatus;
    if (params.updatedBy !== undefined) this.updatedBy = params.updatedBy;
    this.markAsUpdated();
  }

  delete(deletedBy?: string): void {
    this.deletedAt = new Date();
    if (deletedBy) this.updatedBy = deletedBy;
    this.markAsUpdated();
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      ownerId: this.ownerId,
      publishStatus: this.publishStatus,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: typeof this.version === 'bigint' ? Number(this.version) : this.version,
      itemCount: this.itemCount,
    };
  }
}
