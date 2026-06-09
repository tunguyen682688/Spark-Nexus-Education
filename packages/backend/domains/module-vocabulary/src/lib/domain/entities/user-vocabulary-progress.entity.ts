import { AggregateRoot } from '@spark-nest-ed/shared-libs';

/**
 * Learning Status Types for SRS
 */
export type LearningStatus = 'NEW' | 'LEARNING' | 'MASTERED';

/**
 * Domain Entity: UserVocabularyProgress - Aggregate Root
 * Represents a user's learning progress for a vocabulary set item (SRS tracking)
 * Maps to user_vocabulary_progress table
 *
 * This is an Aggregate Root because:
 * - It manages learning state independently for each user-item pair
 * - It has complex business logic (SRS algorithm - SM-2)
 * - It can be accessed and updated independently
 * - It has its own lifecycle (NEW -> LEARNING -> MASTERED)
 *
 * Business Rules:
 * - Tracks spaced repetition system (SRS) data per user per item
 * - Uses SM-2 algorithm (ease factor, interval, repetitions)
 * - Status transitions: NEW -> LEARNING -> MASTERED
 * - Progress is unique per user per item
 */
export class UserVocabularyProgressEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private readonly userId: string,
    private readonly itemId: string,
    private status: LearningStatus,
    private streak: number,
    private masteryLevel: number,
    private lastReview: Date | null,
    private nextReviewAt: Date | null,
    private interval: number,
    private easeFactor: number,
    private repetitions: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt, BigInt(1));
  }

  /**
   * Factory method to create a new UserVocabularyProgress
   */
  static create(
    id: string,
    userId: string,
    itemId: string
  ): UserVocabularyProgressEntity {
    const now = new Date();
    return new UserVocabularyProgressEntity(
      id,
      userId,
      itemId,
      'NEW', // status: default NEW
      0, // streak: default 0
      0, // masteryLevel: default 0
      null, // lastReview: null initially
      null, // nextReviewAt: null initially
      0, // interval: default 0
      2.5, // easeFactor: SM-2 default 2.5
      0, // repetitions: default 0
      now,
      now
    );
  }

  /**
   * Factory method to reconstitute from database
   */
  static fromPersistence(data: {
    id: string;
    userId: string;
    itemId: string;
    status: string;
    streak: number;
    masteryLevel: number;
    lastReview: Date | null;
    nextReviewAt: Date | null;
    interval: number;
    easeFactor: number;
    repetitions: number;
    createdAt: Date;
    updatedAt: Date;
  }): UserVocabularyProgressEntity {
    return new UserVocabularyProgressEntity(
      data.id,
      data.userId,
      data.itemId,
      data.status as LearningStatus,
      data.streak,
      data.masteryLevel,
      data.lastReview,
      data.nextReviewAt,
      data.interval,
      data.easeFactor,
      data.repetitions,
      data.createdAt,
      data.updatedAt
    );
  }

  // ===== Business Logic Methods =====

  /**
   * Update status
   */
  updateStatus(status: LearningStatus): void {
    this.status = status;
    this.markAsUpdated();
  }

  /**
   * Mark as learning
   */
  markAsLearning(): void {
    this.status = 'LEARNING';
    this.markAsUpdated();
  }

  /**
   * Mark as mastered
   */
  markAsMastered(): void {
    this.status = 'MASTERED';
    this.masteryLevel = 1.0;
    this.markAsUpdated();
  }

  /**
   * Reset to new (for relearning)
   */
  resetToNew(): void {
    this.status = 'NEW';
    this.streak = 0;
    this.masteryLevel = 0;
    this.repetitions = 0;
    this.interval = 0;
    this.easeFactor = 2.5;
    this.nextReviewAt = null;
    this.markAsUpdated();
  }

  /**
   * Increment streak
   */
  incrementStreak(): void {
    this.streak++;
    this.markAsUpdated();
  }

  /**
   * Reset streak
   */
  resetStreak(): void {
    this.streak = 0;
    this.markAsUpdated();
  }

  /**
   * Update mastery level (0-1)
   */
  updateMasteryLevel(level: number): void {
    if (level < 0 || level > 1) {
      throw new Error('Mastery level must be between 0 and 1');
    }
    this.masteryLevel = level;
    this.markAsUpdated();
  }

  /**
   * Record a review (SRS algorithm update)
   */
  recordReview(
    quality: number, // 0-5 (SM-2 algorithm)
    nextReviewAt: Date,
    newInterval: number,
    newEaseFactor: number
  ): void {
    if (quality < 0 || quality > 5) {
      throw new Error('Quality must be between 0 and 5');
    }

    this.lastReview = new Date();
    this.nextReviewAt = nextReviewAt;
    this.interval = Math.min(365, newInterval);
    this.easeFactor = newEaseFactor;

    if (quality >= 3) {
      // Successful review
      this.repetitions++;
      this.incrementStreak();
      if (this.status === 'NEW') {
        this.status = 'LEARNING';
      }
      if (this.repetitions >= 5) {
        this.status = 'MASTERED';
      }
    } else {
      // Failed review
      this.repetitions = 0;
      this.resetStreak();
      if (this.status === 'MASTERED') {
        this.status = 'LEARNING';
      }
    }

    // Update mastery level based on repetitions and ease factor
    this.masteryLevel = Math.max(
      0.0,
      Math.min(
        1.0,
        this.repetitions * 0.2 + (this.easeFactor - 2.0) * 0.1
      )
    );

    this.markAsUpdated();
  }

  /**
   * Update SRS parameters
   */
  updateSRSParameters(
    interval: number,
    easeFactor: number,
    nextReviewAt: Date | null
  ): void {
    if (interval < 0) {
      throw new Error('Interval cannot be negative');
    }
    if (easeFactor < 1.3) {
      throw new Error('Ease factor cannot be less than 1.3');
    }

    this.interval = interval;
    this.easeFactor = easeFactor;
    this.nextReviewAt = nextReviewAt;
    this.markAsUpdated();
  }

  /**
   * Check if item is due for review
   */
  isDueForReview(): boolean {
    if (!this.nextReviewAt) {
      return this.status === 'NEW' || this.status === 'LEARNING';
    }
    return new Date() >= this.nextReviewAt && this.status !== 'MASTERED';
  }

  // ===== Getters =====

  getId(): string {
    return this._id;
  }

  getUserId(): string {
    return this.userId;
  }

  getItemId(): string {
    return this.itemId;
  }

  getStatus(): LearningStatus {
    return this.status;
  }

  getStreak(): number {
    return this.streak;
  }

  getMasteryLevel(): number {
    return this.masteryLevel;
  }

  getLastReview(): Date | null {
    return this.lastReview;
  }

  getNextReviewAt(): Date | null {
    return this.nextReviewAt;
  }

  getInterval(): number {
    return this.interval;
  }

  getEaseFactor(): number {
    return this.easeFactor;
  }

  getRepetitions(): number {
    return this.repetitions;
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
    userId: string;
    itemId: string;
    status: string;
    streak: number;
    masteryLevel: number;
    lastReview: Date | null;
    nextReviewAt: Date | null;
    interval: number;
    easeFactor: number;
    repetitions: number;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      userId: this.userId,
      itemId: this.itemId,
      status: this.status,
      streak: this.streak,
      masteryLevel: this.masteryLevel,
      lastReview: this.lastReview,
      nextReviewAt: this.nextReviewAt,
      interval: this.interval,
      easeFactor: this.easeFactor,
      repetitions: this.repetitions,
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
