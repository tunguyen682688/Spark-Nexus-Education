import { Entity } from '@spark-nest-ed/shared-libs';

export class QuestionResultEntity extends Entity<string> {
  private constructor(
    id: string,
    private resultId: string,
    private questionId: string,
    private isCorrect: boolean,
    private scoreAwarded: number,
    private timeSpent: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    resultId: string;
    questionId: string;
    isCorrect: boolean;
    scoreAwarded: number;
    timeSpent: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): QuestionResultEntity {
    const now = new Date();
    return new QuestionResultEntity(
      params.id,
      params.resultId,
      params.questionId,
      params.isCorrect,
      params.scoreAwarded,
      params.timeSpent,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getResultId(): string {
    return this.resultId;
  }

  getQuestionId(): string {
    return this.questionId;
  }

  getIsCorrect(): boolean {
    return this.isCorrect;
  }

  getScoreAwarded(): number {
    return this.scoreAwarded;
  }

  getTimeSpent(): number {
    return this.timeSpent;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      resultId: this.resultId,
      questionId: this.questionId,
      isCorrect: this.isCorrect,
      scoreAwarded: this.scoreAwarded,
      timeSpent: this.timeSpent,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
