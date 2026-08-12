import { Entity } from '@spark-nest-ed/shared-libs';

export class ExamSectionEntity extends Entity<string> {
  private constructor(
    id: string,
    private examId: string,
    private title: string,
    private subtitle: string | null,
    private sectionType: string,
    private instruction: string | null,
    private order: number,
    private durationMinutes: number,
    private questionCount: number,
    private isBreak: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    examId: string;
    title: string;
    subtitle?: string | null;
    sectionType?: string;
    instruction?: string | null;
    order: number;
    durationMinutes?: number;
    questionCount?: number;
    isBreak?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): ExamSectionEntity {
    const now = new Date();
    return new ExamSectionEntity(
      params.id,
      params.examId,
      params.title,
      params.subtitle ?? null,
      params.sectionType ?? 'general',
      params.instruction ?? null,
      params.order,
      params.durationMinutes ?? 0,
      params.questionCount ?? 0,
      params.isBreak ?? false,
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

  getSectionType(): string {
    return this.sectionType;
  }

  getInstruction(): string | null {
    return this.instruction;
  }

  getOrder(): number {
    return this.order;
  }

  getDurationMinutes(): number {
    return this.durationMinutes;
  }

  getSubtitle(): string | null {
    return this.subtitle;
  }

  getQuestionCount(): number {
    return this.questionCount;
  }

  getIsBreak(): boolean {
    return this.isBreak;
  }

  update(params: {
    title?: string;
    subtitle?: string | null;
    sectionType?: string;
    instruction?: string | null;
    order?: number;
    durationMinutes?: number;
    questionCount?: number;
    isBreak?: boolean;
  }): void {
    if (params.title !== undefined) this.title = params.title;
    if (params.subtitle !== undefined) this.subtitle = params.subtitle;
    if (params.sectionType !== undefined) this.sectionType = params.sectionType;
    if (params.instruction !== undefined) this.instruction = params.instruction;
    if (params.order !== undefined) this.order = params.order;
    if (params.durationMinutes !== undefined) this.durationMinutes = params.durationMinutes;
    if (params.questionCount !== undefined) this.questionCount = params.questionCount;
    if (params.isBreak !== undefined) this.isBreak = params.isBreak;
    this.markAsUpdated();
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      examId: this.examId,
      title: this.title,
      subtitle: this.subtitle,
      sectionType: this.sectionType,
      instruction: this.instruction,
      order: this.order,
      durationMinutes: this.durationMinutes,
      questionCount: this.questionCount,
      isBreak: this.isBreak,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
