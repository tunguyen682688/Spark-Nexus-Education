import { Entity } from '@spark-nest-ed/shared-libs';

export class SkillResultEntity extends Entity<string> {
  private constructor(
    id: string,
    private resultId: string,
    private skillName: string,
    private score: number,
    private maxScore: number,
    private accuracyRate: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    resultId: string;
    skillName: string;
    score: number;
    maxScore: number;
    accuracyRate: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): SkillResultEntity {
    const now = new Date();
    return new SkillResultEntity(
      params.id,
      params.resultId,
      params.skillName,
      params.score,
      params.maxScore,
      params.accuracyRate,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getResultId(): string {
    return this.resultId;
  }

  getSkillName(): string {
    return this.skillName;
  }

  getScore(): number {
    return this.score;
  }

  getMaxScore(): number {
    return this.maxScore;
  }

  getAccuracyRate(): number {
    return this.accuracyRate;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      resultId: this.resultId,
      skillName: this.skillName,
      score: this.score,
      maxScore: this.maxScore,
      accuracyRate: this.accuracyRate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
