import { Entity } from '@spark-nest-ed/shared-libs';

export class QuestionChoiceEntity extends Entity<string> {
  private constructor(
    id: string,
    private questionId: string,
    private content: string,
    private isCorrect: boolean,
    private order: number,
    private createdBy: string | null,
    private updatedBy: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    questionId: string;
    content: string;
    isCorrect?: boolean;
    order: number;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): QuestionChoiceEntity {
    const now = new Date();
    return new QuestionChoiceEntity(
      params.id,
      params.questionId,
      params.content,
      params.isCorrect ?? false,
      params.order,
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getQuestionId(): string {
    return this.questionId;
  }

  getContent(): string {
    return this.content;
  }

  getIsCorrect(): boolean {
    return this.isCorrect;
  }

  getOrder(): number {
    return this.order;
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
      questionId: this.questionId,
      content: this.content,
      isCorrect: this.isCorrect,
      order: this.order,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
