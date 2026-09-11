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
    // Per-exam media overrides — reference MediaFile by ID
    private audioMediaId: string | null,
    private imageMediaId: string | null,
    // Per-exam positioning
    private partNumber: number | null,
    private gapNumber: number | null,
    // Per-exam writing/speaking
    private writingTaskType: string | null,
    private speakingPrompt: string | null,
    // SAT
    private isGridIn: boolean,
    // Flexible per-exam data
    private formatMetadata: unknown | null,
    // Passage grouping for multi-question types (TOEIC Part 6/7)
    private passageGroupId: string | null,
    private blankNumber: number | null,
    private subQuestionNumber: number | null,
    private passageTitle: string | null,
    private passageType: string | null,
    private contentHash: string | null,
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
    audioMediaId?: string | null;
    imageMediaId?: string | null;
    partNumber?: number | null;
    gapNumber?: number | null;
    writingTaskType?: string | null;
    speakingPrompt?: string | null;
    isGridIn?: boolean;
    formatMetadata?: unknown | null;
    passageGroupId?: string | null;
    blankNumber?: number | null;
    subQuestionNumber?: number | null;
    passageTitle?: string | null;
    passageType?: string | null;
    contentHash?: string | null;
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
      params.audioMediaId ?? null,
      params.imageMediaId ?? null,
      params.partNumber ?? null,
      params.gapNumber ?? null,
      params.writingTaskType ?? null,
      params.speakingPrompt ?? null,
      params.isGridIn ?? false,
      params.formatMetadata ?? null,
      params.passageGroupId ?? null,
      params.blankNumber ?? null,
      params.subQuestionNumber ?? null,
      params.passageTitle ?? null,
      params.passageType ?? null,
      params.contentHash ?? null,
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

  getAudioMediaId(): string | null {
    return this.audioMediaId;
  }

  getImageMediaId(): string | null {
    return this.imageMediaId;
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

  getPassageGroupId(): string | null {
    return this.passageGroupId;
  }

  getBlankNumber(): number | null {
    return this.blankNumber;
  }

  getSubQuestionNumber(): number | null {
    return this.subQuestionNumber;
  }

  getPassageTitle(): string | null {
    return this.passageTitle;
  }

  getPassageType(): string | null {
    return this.passageType;
  }

  getContentHash(): string | null {
    return this.contentHash;
  }

  update(params: {
    sectionId?: string | null;
    order?: number;
    points?: number;
    updatedBy?: string | null;
    audioMediaId?: string | null;
    imageMediaId?: string | null;
    partNumber?: number | null;
    gapNumber?: number | null;
    writingTaskType?: string | null;
    speakingPrompt?: string | null;
    isGridIn?: boolean;
    formatMetadata?: unknown | null;
    passageGroupId?: string | null;
    blankNumber?: number | null;
    subQuestionNumber?: number | null;
    passageTitle?: string | null;
    passageType?: string | null;
    contentHash?: string | null;
  }): void {
    if (params.sectionId !== undefined) this.sectionId = params.sectionId;
    if (params.order !== undefined) this.order = params.order;
    if (params.points !== undefined) this.points = params.points;
    if (params.updatedBy !== undefined) this.updatedBy = params.updatedBy;
    if (params.audioMediaId !== undefined) this.audioMediaId = params.audioMediaId;
    if (params.imageMediaId !== undefined) this.imageMediaId = params.imageMediaId;
    if (params.partNumber !== undefined) this.partNumber = params.partNumber;
    if (params.gapNumber !== undefined) this.gapNumber = params.gapNumber;
    if (params.writingTaskType !== undefined) this.writingTaskType = params.writingTaskType;
    if (params.speakingPrompt !== undefined) this.speakingPrompt = params.speakingPrompt;
    if (params.isGridIn !== undefined) this.isGridIn = params.isGridIn;
    if (params.formatMetadata !== undefined) this.formatMetadata = params.formatMetadata;
    if (params.passageGroupId !== undefined) this.passageGroupId = params.passageGroupId;
    if (params.blankNumber !== undefined) this.blankNumber = params.blankNumber;
    if (params.subQuestionNumber !== undefined) this.subQuestionNumber = params.subQuestionNumber;
    if (params.passageTitle !== undefined) this.passageTitle = params.passageTitle;
    if (params.passageType !== undefined) this.passageType = params.passageType;
    if (params.contentHash !== undefined) this.contentHash = params.contentHash;
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
      audioMediaId: this.audioMediaId,
      imageMediaId: this.imageMediaId,
      partNumber: this.partNumber,
      gapNumber: this.gapNumber,
      writingTaskType: this.writingTaskType,
      speakingPrompt: this.speakingPrompt,
      isGridIn: this.isGridIn,
      formatMetadata: this.formatMetadata,
      passageGroupId: this.passageGroupId,
      blankNumber: this.blankNumber,
      subQuestionNumber: this.subQuestionNumber,
      passageTitle: this.passageTitle,
      passageType: this.passageType,
      contentHash: this.contentHash,
    };
  }
}
