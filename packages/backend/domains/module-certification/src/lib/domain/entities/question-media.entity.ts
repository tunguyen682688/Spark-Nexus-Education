import { Entity } from '@spark-nest-ed/shared-libs';

export class QuestionMediaEntity extends Entity<string> {
  private constructor(
    id: string,
    private questionId: string,
    private mediaUrl: string,
    private mediaType: string,
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
    mediaUrl: string;
    mediaType: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): QuestionMediaEntity {
    const now = new Date();
    return new QuestionMediaEntity(
      params.id,
      params.questionId,
      params.mediaUrl,
      params.mediaType,
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getQuestionId(): string {
    return this.questionId;
  }

  getMediaUrl(): string {
    return this.mediaUrl;
  }

  getMediaType(): string {
    return this.mediaType;
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
      mediaUrl: this.mediaUrl,
      mediaType: this.mediaType,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
