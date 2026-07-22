import { Entity } from '@spark-nest-ed/shared-libs';

export class ExamRuleEntity extends Entity<string> {
  private constructor(
    id: string,
    private examId: string,
    private ruleType: string,
    private ruleValue: string,
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
    ruleType: string;
    ruleValue: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): ExamRuleEntity {
    const now = new Date();
    return new ExamRuleEntity(
      params.id,
      params.examId,
      params.ruleType,
      params.ruleValue,
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now
    );
  }

  getExamId(): string {
    return this.examId;
  }

  getRuleType(): string {
    return this.ruleType;
  }

  getRuleValue(): string {
    return this.ruleValue;
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
      ruleType: this.ruleType,
      ruleValue: this.ruleValue,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
