import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class ReadingSessionEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private readonly userId: string,
    private readonly articleId: string,
    private startTime: Date,
    private endTime: Date,
    private duration: number,
    private wordsRead: number,
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
    startTime: Date;
    endTime: Date;
    duration: number;
    wordsRead: number;
  }): ReadingSessionEntity {
    const now = new Date();
    return new ReadingSessionEntity(
      params.id,
      params.userId,
      params.articleId,
      params.startTime,
      params.endTime,
      params.duration,
      params.wordsRead,
      now,
      now,
      BigInt(1)
    );
  }

  static fromPersistence(data: {
    id: string;
    userId: string;
    articleId: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    wordsRead: number;
    createdAt: Date;
  }): ReadingSessionEntity {
    return new ReadingSessionEntity(
      data.id,
      data.userId,
      data.articleId,
      data.startTime,
      data.endTime,
      data.duration,
      data.wordsRead,
      data.createdAt,
      data.createdAt,
      BigInt(1)
    );
  }

  getUserId() { return this.userId; }
  getArticleId() { return this.articleId; }
  getStartTime() { return this.startTime; }
  getEndTime() { return this.endTime; }
  getDuration() { return this.duration; }
  getWordsRead() { return this.wordsRead; }

  toPersistence() {
    return {
      id: this._id,
      userId: this.userId,
      articleId: this.articleId,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      wordsRead: this.wordsRead,
      createdAt: this._createdAt,
    };
  }

  toPlainObject(): Record<string, unknown> {
    return this.toPersistence();
  }
}
