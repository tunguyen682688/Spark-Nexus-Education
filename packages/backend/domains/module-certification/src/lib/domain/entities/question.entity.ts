import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class QuestionEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private title: string | null,
    private content: string,
    private type: string,
    private difficulty: string,
    private status: string,
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
    title?: string | null;
    content: string;
    type: string;
    difficulty: string;
    status?: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    deletedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    version?: bigint;
  }): QuestionEntity {
    const now = new Date();
    return new QuestionEntity(
      params.id,
      params.title ?? null,
      params.content,
      params.type,
      params.difficulty,
      params.status ?? 'draft',
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.deletedAt ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.version ?? BigInt(1)
    );
  }

  getTitle(): string | null {
    return this.title;
  }

  getContent(): string {
    return this.content;
  }

  getType(): string {
    return this.type;
  }

  getDifficulty(): string {
    return this.difficulty;
  }

  getStatus(): string {
    return this.status;
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

  update(params: {
    title?: string | null;
    content?: string;
    type?: string;
    difficulty?: string;
    status?: string;
    updatedBy?: string | null;
  }): void {
    if (params.title !== undefined) this.title = params.title;
    if (params.content !== undefined) this.content = params.content;
    if (params.type !== undefined) this.type = params.type;
    if (params.difficulty !== undefined) this.difficulty = params.difficulty;
    if (params.status !== undefined) this.status = params.status;
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
      content: this.content,
      type: this.type,
      difficulty: this.difficulty,
      status: this.status,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}
