import { Entity } from '@spark-nest-ed/shared-libs';

export class ExamSectionEntity extends Entity<string> {
  private constructor(
    id: string,
    private examId: string,
    private title: string,
    private instruction: string | null,
    private order: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    examId: string;
    title: string;
    instruction?: string | null;
    order: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): ExamSectionEntity {
    const now = new Date();
    return new ExamSectionEntity(
      params.id,
      params.examId,
      params.title,
      params.instruction ?? null,
      params.order,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getExamId(): string {
    return this.examId;
  }

  getTitle(): string {
    return this.title;
  }

  getInstruction(): string | null {
    return this.instruction;
  }

  getOrder(): number {
    return this.order;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      examId: this.examId,
      title: this.title,
      instruction: this.instruction,
      order: this.order,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
