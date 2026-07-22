import { Entity } from '@spark-nest-ed/shared-libs';

export class ExamQuestionEntity extends Entity<string> {
  private constructor(
    id: string,
    private examId: string,
    private questionId: string,
    private order: number,
    private points: number,
    private createdBy: string | null,
    private updatedBy: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    examId: string;
    questionId: string;
    order: number;
    points?: number;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): ExamQuestionEntity {
    const now = new Date();
    return new ExamQuestionEntity(
      params.id,
      params.examId,
      params.questionId,
      params.order,
      params.points ?? 1.0,
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getExamId(): string {
    return this.examId;
  }

  getQuestionId(): string {
    return this.questionId;
  }

  getOrder(): number {
    return this.order;
  }

  getPoints(): number {
    return this.points;
  }

  getCreatedBy(): string | null {
    return this.createdBy;
  }

  getUpdatedBy(): string | null {
    return this.updatedBy;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      examId: this.examId,
      questionId: this.questionId,
      order: this.order,
      points: this.points,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
