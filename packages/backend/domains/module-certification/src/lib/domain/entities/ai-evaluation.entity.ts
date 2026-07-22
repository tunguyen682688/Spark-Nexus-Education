import { Entity } from '@spark-nest-ed/shared-libs';

export class AiEvaluationEntity extends Entity<string> {
  private constructor(
    id: string,
    private resultId: string,
    private evaluationText: string,
    private feedbackJson: unknown,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    resultId: string;
    evaluationText: string;
    feedbackJson: unknown;
    createdAt?: Date;
    updatedAt?: Date;
  }): AiEvaluationEntity {
    const now = new Date();
    return new AiEvaluationEntity(
      params.id,
      params.resultId,
      params.evaluationText,
      params.feedbackJson,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getResultId(): string {
    return this.resultId;
  }

  getEvaluationText(): string {
    return this.evaluationText;
  }

  getFeedbackJson(): unknown {
    return this.feedbackJson;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      resultId: this.resultId,
      evaluationText: this.evaluationText,
      feedbackJson: this.feedbackJson,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
