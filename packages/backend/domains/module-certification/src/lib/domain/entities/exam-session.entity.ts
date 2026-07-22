import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class ExamSessionEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private examId: string,
    private userId: string,
    private startedAt: Date,
    private endedAt: Date | null,
    private status: string,
    createdAt: Date,
    updatedAt: Date,
    version: bigint
  ) {
    super(id, createdAt, updatedAt, version);
  }

  static create(params: {
    id: string;
    examId: string;
    userId: string;
    startedAt?: Date;
    endedAt?: Date | null;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
    version?: bigint;
  }): ExamSessionEntity {
    const now = new Date();
    return new ExamSessionEntity(
      params.id,
      params.examId,
      params.userId,
      params.startedAt ?? now,
      params.endedAt ?? null,
      params.status ?? 'started',
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.version ?? BigInt(1)
    );
  }

  getExamId(): string {
    return this.examId;
  }

  getUserId(): string {
    return this.userId;
  }

  getStartedAt(): Date {
    return this.startedAt;
  }

  getEndedAt(): Date | null {
    return this.endedAt;
  }

  getStatus(): string {
    return this.status;
  }

  complete(): void {
    this.status = 'completed';
    this.endedAt = new Date();
    this.markAsUpdated();
  }

  abandon(): void {
    this.status = 'abandoned';
    this.endedAt = new Date();
    this.markAsUpdated();
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      examId: this.examId,
      userId: this.userId,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}
