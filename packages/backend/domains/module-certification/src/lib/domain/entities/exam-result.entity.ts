import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class ExamResultEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private sessionId: string,
    private examId: string,
    private userId: string,
    private totalScore: number,
    private passed: boolean,
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
    passed: boolean;
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
      params.passed,
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

  isPassed(): boolean {
    return this.passed;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      sessionId: this.sessionId,
      examId: this.examId,
      userId: this.userId,
      totalScore: this.totalScore,
      passed: this.passed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}
