import { AggregateRoot } from '@spark-nest-ed/shared-libs';
import { ReadingProgressUpdatedEvent } from '../events/reading-progress-updated.event';

export class ReadingProgressEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private readonly userId: string,
    private readonly articleId: string,
    private progress: number,
    private lastPosition: number,
    private timeSpent: number,
    private completedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    version: bigint
  ) {
    super(id, createdAt, updatedAt, version);
  }

  static create(params: {
    id: string;
    userId: string;
    articleId: string;
    progress?: number;
    lastPosition?: number;
    timeSpent?: number;
  }): ReadingProgressEntity {
    const now = new Date();
    const progress = params.progress || 0;
    const completedAt = progress >= 100 ? now : null;

    const entity = new ReadingProgressEntity(
      params.id,
      params.userId,
      params.articleId,
      progress,
      params.lastPosition || 0,
      params.timeSpent || 0,
      completedAt,
      now,
      now,
      BigInt(1)
    );

    entity.addDomainEvent(
      new ReadingProgressUpdatedEvent(
        entity.userId,
        entity.articleId,
        entity.progress,
        entity.timeSpent,
        entity.completedAt
      )
    );

    return entity;
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    articleId: string;
    progress: number;
    lastPosition: number;
    timeSpent: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ReadingProgressEntity {
    return new ReadingProgressEntity(
      data.id,
      data.userId,
      data.articleId,
      data.progress,
      data.lastPosition,
      data.timeSpent,
      data.completedAt,
      data.createdAt,
      data.updatedAt,
      BigInt(1)
    );
  }

  updateProgress(progress: number, lastPosition: number, timeSpent: number): void {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    if (progress > this.progress) {
      this.progress = progress;
    }

    if (lastPosition !== undefined) {
      this.lastPosition = lastPosition;
    }

    if (timeSpent !== undefined && timeSpent > this.timeSpent) {
      this.timeSpent = timeSpent;
    }

    if (this.progress >= 100 && !this.completedAt) {
      this.completedAt = new Date();
    }

    this.markAsUpdated();

    this.addDomainEvent(
      new ReadingProgressUpdatedEvent(
        this.userId,
        this.articleId,
        this.progress,
        this.timeSpent,
        this.completedAt
      )
    );
  }

  getId(): string {
    return this._id;
  }

  getUserId(): string {
    return this.userId;
  }

  getArticleId(): string {
    return this.articleId;
  }

  getProgress(): number {
    return this.progress;
  }

  getLastPosition(): number {
    return this.lastPosition;
  }

  getTimeSpent(): number {
    return this.timeSpent;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  toPersistence() {
    return {
      id: this._id,
      userId: this.userId,
      articleId: this.articleId,
      progress: this.progress,
      lastPosition: this.lastPosition,
      timeSpent: this.timeSpent,
      completedAt: this.completedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  toPlainObject(): Record<string, unknown> {
    return this.toPersistence();
  }
}
