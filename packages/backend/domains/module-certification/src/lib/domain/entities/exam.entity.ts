import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export class ExamEntity extends AggregateRoot<string> {
  private constructor(
    id: string,
    private title: string,
    private description: string | null,
    private duration: number,
    private totalQuestions: number,
    private maxScore: number,
    private passScore: number,
    private publishStatus: string,
    private collectionId: string,
    private examType: string,
    private certificationType: string | null,
    private level: string | null,
    private chapterId: string | null,
    private order: number,
    private initializationStatus: string,
    private createdBy: string | null,
    private updatedBy: string | null,
    private deletedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    version: bigint
  ) {
    super(id, createdAt, updatedAt, version);
  }

  static create(params: {
    id: string;
    title: string;
    description?: string | null;
    duration: number;
    totalQuestions: number;
    maxScore: number;
    passScore: number;
    publishStatus?: string;
    collectionId: string;
    examType?: string;
    certificationType?: string | null;
    level?: string | null;
    chapterId?: string | null;
    order?: number;
    initializationStatus?: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    deletedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    version?: bigint;
  }): ExamEntity {
    const now = new Date();
    return new ExamEntity(
      params.id,
      params.title,
      params.description ?? null,
      params.duration,
      params.totalQuestions,
      params.maxScore,
      params.passScore,
      params.publishStatus ?? 'draft',
      params.collectionId,
      params.examType ?? 'FULL_MOCK',
      params.certificationType ?? null,
      params.level ?? null,
      params.chapterId ?? null,
      params.order ?? 0,
      params.initializationStatus ?? 'none',
      params.createdBy ?? null,
      params.updatedBy ?? null,
      params.deletedAt ?? null,
      params.createdAt ?? now,
      params.updatedAt ?? now,
      params.version ?? BigInt(1)
    );
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null {
    return this.description;
  }

  getDuration(): number {
    return this.duration;
  }

  getTotalQuestions(): number {
    return this.totalQuestions;
  }

  getMaxScore(): number {
    return this.maxScore;
  }

  getPassScore(): number {
    return this.passScore;
  }

  getPublishStatus(): string {
    return this.publishStatus;
  }

  getCollectionId(): string {
    return this.collectionId;
  }

  getExamType(): string {
    return this.examType;
  }

  getCertificationType(): string | null {
    return this.certificationType;
  }

  getLevel(): string | null {
    return this.level;
  }

  getChapterId(): string | null {
    return this.chapterId;
  }

  getOrder(): number {
    return this.order;
  }

  getInitializationStatus(): string {
    return this.initializationStatus;
  }

  getCreatedBy(): string | null {
    return this.createdBy;
  }

  getUpdatedBy(): string | null {
    return this.updatedBy;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  update(params: {
    title?: string;
    description?: string | null;
    duration?: number;
    totalQuestions?: number;
    maxScore?: number;
    passScore?: number;
    publishStatus?: string;
    collectionId?: string;
    examType?: string;
    certificationType?: string | null;
    level?: string | null;
    chapterId?: string | null;
    order?: number;
    initializationStatus?: string;
    updatedBy?: string | null;
  }): void {
    if (params.title !== undefined) this.title = params.title;
    if (params.description !== undefined) this.description = params.description;
    if (params.duration !== undefined) this.duration = params.duration;
    if (params.totalQuestions !== undefined) this.totalQuestions = params.totalQuestions;
    if (params.maxScore !== undefined) this.maxScore = params.maxScore;
    if (params.passScore !== undefined) this.passScore = params.passScore;
    if (params.publishStatus !== undefined) this.publishStatus = params.publishStatus;
    if (params.collectionId !== undefined) this.collectionId = params.collectionId;
    if (params.examType !== undefined) this.examType = params.examType;
    if (params.certificationType !== undefined) this.certificationType = params.certificationType;
    if (params.level !== undefined) this.level = params.level;
    if (params.chapterId !== undefined) this.chapterId = params.chapterId;
    if (params.order !== undefined) this.order = params.order;
    if (params.initializationStatus !== undefined) this.initializationStatus = params.initializationStatus;
    if (params.updatedBy !== undefined) this.updatedBy = params.updatedBy;
    this.markAsUpdated();
  }

  delete(deletedBy?: string): void {
    this.deletedAt = new Date();
    if (deletedBy) this.updatedBy = deletedBy;
    this.markAsUpdated();
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      duration: this.duration,
      totalQuestions: this.totalQuestions,
      maxScore: this.maxScore,
      passScore: this.passScore,
      publishStatus: this.publishStatus,
      collectionId: this.collectionId,
      examType: this.examType,
      certificationType: this.certificationType,
      level: this.level,
      chapterId: this.chapterId,
      order: this.order,
      initializationStatus: this.initializationStatus,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: typeof this.version === 'bigint' ? Number(this.version) : this.version,
    };
  }
}
