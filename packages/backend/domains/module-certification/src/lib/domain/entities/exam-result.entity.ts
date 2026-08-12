import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class ExamResultEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private sessionId: string,
    private examId: string,
    private userId: string,
    private totalScore: number,
    private maxScore: number,
    private accuracyRate: number,
    private timeSpentMinutes: number,
    private passed: boolean,
    private completedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    version: bigint
  ) {
    super(id, createdAt, updatedAt, version);
  }

  static create(params: {
    id: string;
    sessionId: string;
    examId: string;
    userId: string;
    totalScore: number;
    maxScore?: number;
    accuracyRate?: number;
    timeSpentMinutes?: number;
    passed: boolean;
    completedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    version?: bigint;
  }): ExamResultEntity {
    const now = new Date();
    return new ExamResultEntity(
      params.id,
      params.sessionId,
      params.examId,
      params.userId,
      params.totalScore,
      params.maxScore ?? 100.0,
      params.accuracyRate ?? 0.0,
      params.timeSpentMinutes ?? 0,
      params.passed,
      params.completedAt ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.version ?? BigInt(1)
    );
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getExamId(): string {
    return this.examId;
  }

  getUserId(): string {
    return this.userId;
  }

  getTotalScore(): number {
    return this.totalScore;
  }

  getMaxScore(): number {
    return this.maxScore;
  }

  getAccuracyRate(): number {
    return this.accuracyRate;
  }

  getTimeSpentMinutes(): number {
    return this.timeSpentMinutes;
  }

  isPassed(): boolean {
    return this.passed;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      sessionId: this.sessionId,
      examId: this.examId,
      userId: this.userId,
      totalScore: this.totalScore,
      maxScore: this.maxScore,
      accuracyRate: this.accuracyRate,
      timeSpentMinutes: this.timeSpentMinutes,
      passed: this.passed,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: typeof this.version === 'bigint' ? Number(this.version) : this.version,
    };
  }
}
