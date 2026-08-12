import { Entity } from '@spark-nest-ed/shared-libs';

export class ExamQuestionEntity extends Entity<string> {
  private constructor(
    id: string,
    private examId: string,
    private questionId: string,
    private sectionId: string | null,
    private order: number,
    private points: number,
    private createdBy: string | null,
    private updatedBy: string | null,
    createdAt: Date,
    updatedAt: Date,
    // Per-exam media overrides
    private audioUrl: string | null,
    private imageUrl: string | null,
    // Per-exam positioning
    private partNumber: number | null,
    private gapNumber: number | null,
    // Per-exam writing/speaking
    private writingTaskType: string | null,
    private speakingPrompt: string | null,
    // SAT
    private isGridIn: boolean,
    // Flexible per-exam data
    private formatMetadata: unknown | null
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(params: {
    id: string;
    examId: string;
    questionId: string;
    sectionId?: string | null;
    order: number;
    points?: number;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    audioUrl?: string | null;
    imageUrl?: string | null;
    partNumber?: number | null;
    gapNumber?: number | null;
    writingTaskType?: string | null;
    speakingPrompt?: string | null;
    isGridIn?: boolean;
    formatMetadata?: unknown | null;
  }): ExamQuestionEntity {
    const now = new Date();
    return new ExamQuestionEntity(
      params.id,
      params.examId,
      params.questionId,
      params.sectionId ?? null,
      params.order,
      params.points ?? 1.0,
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.audioUrl ?? null,
      params.imageUrl ?? null,
      params.partNumber ?? null,
      params.gapNumber ?? null,
      params.writingTaskType ?? null,
      params.speakingPrompt ?? null,
      params.isGridIn ?? false,
      params.formatMetadata ?? null
    );
  }

  getExamId(): string {
    return this.examId;
  }

  getQuestionId(): string {
    return this.questionId;
  }

  getSectionId(): string | null {
    return this.sectionId;
  }

  getOrder(): number {
    return this.order;
  }

  getPoints(): number {
    return this.points;
  }

  getCreatedBy(): string | null {
    return this.createdBy;
  }

  getUpdatedBy(): string | null {
    return this.updatedBy;
  }

  getAudioUrl(): string | null {
    return this.audioUrl;
  }

  getImageUrl(): string | null {
    return this.imageUrl;
  }

  getPartNumber(): number | null {
    return this.partNumber;
  }

  getGapNumber(): number | null {
    return this.gapNumber;
  }

  getWritingTaskType(): string | null {
    return this.writingTaskType;
  }

  getSpeakingPrompt(): string | null {
    return this.speakingPrompt;
  }

  getIsGridIn(): boolean {
    return this.isGridIn;
  }

  getFormatMetadata(): unknown | null {
    return this.formatMetadata;
  }

  update(params: {
    sectionId?: string | null;
    order?: number;
    points?: number;
    updatedBy?: string | null;
    audioUrl?: string | null;
    imageUrl?: string | null;
    partNumber?: number | null;
    gapNumber?: number | null;
    writingTaskType?: string | null;
    speakingPrompt?: string | null;
    isGridIn?: boolean;
    formatMetadata?: unknown | null;
  }): void {
    if (params.sectionId !== undefined) this.sectionId = params.sectionId;
    if (params.order !== undefined) this.order = params.order;
    if (params.points !== undefined) this.points = params.points;
    if (params.updatedBy !== undefined) this.updatedBy = params.updatedBy;
    if (params.audioUrl !== undefined) this.audioUrl = params.audioUrl;
    if (params.imageUrl !== undefined) this.imageUrl = params.imageUrl;
    if (params.partNumber !== undefined) this.partNumber = params.partNumber;
    if (params.gapNumber !== undefined) this.gapNumber = params.gapNumber;
    if (params.writingTaskType !== undefined) this.writingTaskType = params.writingTaskType;
    if (params.speakingPrompt !== undefined) this.speakingPrompt = params.speakingPrompt;
    if (params.isGridIn !== undefined) this.isGridIn = params.isGridIn;
    if (params.formatMetadata !== undefined) this.formatMetadata = params.formatMetadata;
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      examId: this.examId,
      questionId: this.questionId,
      sectionId: this.sectionId,
      order: this.order,
      points: this.points,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audioUrl: this.audioUrl,
      imageUrl: this.imageUrl,
      partNumber: this.partNumber,
      gapNumber: this.gapNumber,
      writingTaskType: this.writingTaskType,
      speakingPrompt: this.speakingPrompt,
      isGridIn: this.isGridIn,
      formatMetadata: this.formatMetadata,
    };
  }
}
