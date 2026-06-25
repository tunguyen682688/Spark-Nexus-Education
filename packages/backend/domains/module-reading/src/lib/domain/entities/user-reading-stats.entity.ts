import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class UserReadingStatsEntity extends AggregateRoot<string> {
  private constructor(
    id: string, // userId
    private totalArticles: number,
    private totalWords: number,
    private totalTime: number,
    private avgWpm: number,
    private masteryLevel: string,
    private currentStreak: number,
    private lastActiveAt: Date,
    createdAt: Date,
    updatedAt: Date,
    version: bigint
  ) {
    super(id, createdAt, updatedAt, version);
  }

  static create(userId: string): UserReadingStatsEntity {
    const now = new Date();
    return new UserReadingStatsEntity(
      userId,
      0, 0, 0, 0, 'A1', 0, now, now, now, BigInt(1)
    );
  }

  static fromPersistence(data: {
    userId: string;
    totalArticles: number;
    totalWords: number;
    totalTime: number;
    avgWpm: number;
    masteryLevel: string;
    currentStreak: number;
    lastActiveAt: Date;
    updatedAt: Date;
  }): UserReadingStatsEntity {
    return new UserReadingStatsEntity(
      data.userId,
      data.totalArticles,
      data.totalWords,
      data.totalTime,
      data.avgWpm,
      data.masteryLevel,
      data.currentStreak,
      data.lastActiveAt,
      data.lastActiveAt, // using lastActiveAt as fallback for createdAt
      data.updatedAt,
      BigInt(1)
    );
  }

  updateStats(params: {
    totalArticles?: number;
    totalWords?: number;
    totalTime?: number;
    avgWpm?: number;
    masteryLevel?: string;
    currentStreak?: number;
    lastActiveAt?: Date;
  }) {
    if (params.totalArticles !== undefined) this.totalArticles = params.totalArticles;
    if (params.totalWords !== undefined) this.totalWords = params.totalWords;
    if (params.totalTime !== undefined) this.totalTime = params.totalTime;
    if (params.avgWpm !== undefined) this.avgWpm = params.avgWpm;
    if (params.masteryLevel !== undefined) this.masteryLevel = params.masteryLevel;
    if (params.currentStreak !== undefined) this.currentStreak = params.currentStreak;
    if (params.lastActiveAt !== undefined) this.lastActiveAt = params.lastActiveAt;
    this.markAsUpdated();
  }

  getUserId() { return this._id; }
  getTotalArticles() { return this.totalArticles; }
  getTotalWords() { return this.totalWords; }
  getTotalTime() { return this.totalTime; }
  getAvgWpm() { return this.avgWpm; }
  getMasteryLevel() { return this.masteryLevel; }
  getCurrentStreak() { return this.currentStreak; }
  getLastActiveAt() { return this.lastActiveAt; }

  toPersistence() {
    return {
      userId: this._id,
      totalArticles: this.totalArticles,
      totalWords: this.totalWords,
      totalTime: this.totalTime,
      avgWpm: this.avgWpm,
      masteryLevel: this.masteryLevel,
      currentStreak: this.currentStreak,
      lastActiveAt: this.lastActiveAt,
      updatedAt: this._updatedAt,
    };
  }

  toPlainObject(): Record<string, unknown> {
    return this.toPersistence();
  }
}
