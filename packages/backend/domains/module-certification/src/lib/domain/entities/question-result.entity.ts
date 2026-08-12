import { Entity } from '@spark-nest-ed/shared-libs';

export class QuestionResultEntity extends Entity<string> {
  private constructor(
    id: string,
    private resultId: string,
    private questionId: string,
    private questionText: string | null,
    private isCorrect: boolean,
    private scoreAwarded: number,
    private userAnswer: string | null,
    private correctAnswer: string | null,
    private explanation: string | null,
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
    questionText?: string | null;
    isCorrect: boolean;
    scoreAwarded: number;
    userAnswer?: string | null;
    correctAnswer?: string | null;
    explanation?: string | null;
    timeSpent: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): QuestionResultEntity {
    const now = new Date();
    return new QuestionResultEntity(
      params.id,
      params.resultId,
      params.questionId,
      params.questionText ?? null,
      params.isCorrect,
      params.scoreAwarded,
      params.userAnswer ?? null,
      params.correctAnswer ?? null,
      params.explanation ?? null,
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

  getQuestionText(): string | null {
    return this.questionText;
  }

  getIsCorrect(): boolean {
    return this.isCorrect;
  }

  getScoreAwarded(): number {
    return this.scoreAwarded;
  }

  getUserAnswer(): string | null {
    return this.userAnswer;
  }

  getCorrectAnswer(): string | null {
    return this.correctAnswer;
  }

  getExplanation(): string | null {
    return this.explanation;
  }

  getTimeSpent(): number {
    return this.timeSpent;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      resultId: this.resultId,
      questionId: this.questionId,
      questionText: this.questionText,
      isCorrect: this.isCorrect,
      scoreAwarded: this.scoreAwarded,
      userAnswer: this.userAnswer,
      correctAnswer: this.correctAnswer,
      explanation: this.explanation,
      timeSpent: this.timeSpent,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
