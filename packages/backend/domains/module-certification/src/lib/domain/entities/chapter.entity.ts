import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class ChapterEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private collectionId: string,
    private title: string,
    private description: string | null,
    private order: number,
    private createdBy: string | null,
    private updatedBy: string | null,
    private deletedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    version: bigint
  ) {
    super(id, createdAt, updatedAt, version);
  }

  static create(params: {
    id: string;
    collectionId: string;
    title: string;
    description?: string | null;
    order?: number;
    createdBy?: string | null;
    updatedBy?: string | null;
    deletedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    version?: bigint;
  }): ChapterEntity {
    const now = new Date();
    return new ChapterEntity(
      params.id,
      params.collectionId,
      params.title,
      params.description ?? null,
      params.order ?? 0,
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.deletedAt ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.version ?? BigInt(1)
    );
  }

  getCollectionId(): string {
    return this.collectionId;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getOrder(): number {
    return this.order;
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

  update(params: { title?: string; description?: string | null; order?: number; updatedBy?: string }): void {
    if (params.title !== undefined) this.title = params.title;
    if (params.description !== undefined) this.description = params.description;
    if (params.order !== undefined) this.order = params.order;
    if (params.updatedBy !== undefined) this.updatedBy = params.updatedBy;
    this.markAsUpdated();
  }

  toPlainObject() {
    return {
      id: this.id,
      collectionId: this.collectionId,
      title: this.title,
      description: this.description,
      order: this.order,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}
