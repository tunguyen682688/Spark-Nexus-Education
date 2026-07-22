import { Entity } from '@spark-nest-ed/shared-libs';

export class SessionAnswerEntity extends Entity<string> {
  private constructor(
    id: string,
    private sessionId: string,
    private questionId: string,
    private answerText: string | null,
    private choiceIds: string[],
    private isCorrect: boolean | null,
    private points: number | null,
    private createdBy: string | null,
    private updatedBy: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    sessionId: string;
    questionId: string;
    answerText?: string | null;
    choiceIds?: string[];
    isCorrect?: boolean | null;
    points?: number | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): SessionAnswerEntity {
    const now = new Date();
    return new SessionAnswerEntity(
      params.id,
      params.sessionId,
      params.questionId,
      params.answerText ?? null,
      params.choiceIds ?? [],
      params.isCorrect ?? null,
      params.points ?? null,
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getQuestionId(): string {
    return this.questionId;
  }

  getAnswerText(): string | null {
    return this.answerText;
  }

  getChoiceIds(): string[] {
    return this.choiceIds;
  }

  getIsCorrect(): boolean | null {
    return this.isCorrect;
  }

  getPoints(): number | null {
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
      sessionId: this.sessionId,
      questionId: this.questionId,
      answerText: this.answerText,
      choiceIds: this.choiceIds,
      isCorrect: this.isCorrect,
      points: this.points,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
