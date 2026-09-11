import { AggregateRoot } from '@spark-nest-ed/shared-libs';

export interface MediaFileProps {
  storageKey: string;
  bucket: string;
  provider: string;
  mimeType: string;
  size: number;
  originalName: string;
  width: number | null;
  height: number | null;
  visibility: 'public' | 'private';
  status: 'active' | 'deleted' | 'processing';
  checksum: string;
  ownerId: string | null;
  metadata: Record<string, unknown> | null;
}

export class MediaFileEntity extends AggregateRoot<string> {
  private props: MediaFileProps;

  private constructor(
    id: string,
    props: MediaFileProps,
    createdAt: Date,
    updatedAt: Date,
    version: bigint,
  ) {
    super(id, createdAt, updatedAt, version);
    this.props = props;
  }

  static create(params: {
    id?: string;
    storageKey: string;
    bucket: string;
    provider: string;
    mimeType: string;
    size: number;
    originalName: string;
    width?: number | null;
    height?: number | null;
    visibility?: 'public' | 'private';
    status?: 'active' | 'deleted' | 'processing';
    checksum: string;
    ownerId?: string | null;
    metadata?: Record<string, unknown> | null;
  }): MediaFileEntity {
    const now = new Date();
    return new MediaFileEntity(
      params.id ?? crypto.randomUUID(),
      {
        storageKey: params.storageKey,
        bucket: params.bucket,
        provider: params.provider,
        mimeType: params.mimeType,
        size: params.size,
        originalName: params.originalName,
        width: params.width ?? null,
        height: params.height ?? null,
        visibility: params.visibility ?? 'public',
        status: params.status ?? 'processing',
        checksum: params.checksum,
        ownerId: params.ownerId ?? null,
        metadata: params.metadata ?? null,
      },
      now,
      now,
      1n,
    );
  }

  static fromPersistence(params: {
    id: string;
    storageKey: string;
    bucket: string;
    provider: string;
    mimeType: string;
    size: number;
    originalName: string;
    width: number | null;
    height: number | null;
    visibility: string;
    status: string;
    checksum: string;
    ownerId: string | null;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
    version: number | bigint;
  }): MediaFileEntity {
    return new MediaFileEntity(
      params.id,
      {
        storageKey: params.storageKey,
        bucket: params.bucket,
        provider: params.provider,
        mimeType: params.mimeType,
        size: params.size,
        originalName: params.originalName,
        width: params.width,
        height: params.height,
        visibility: params.visibility as 'public' | 'private',
        status: params.status as 'active' | 'deleted' | 'processing',
        checksum: params.checksum,
        ownerId: params.ownerId,
        metadata: params.metadata as Record<string, unknown> | null,
      },
      params.createdAt,
      params.updatedAt,
      BigInt(params.version),
    );
  }

  getStorageKey(): string { return this.props.storageKey; }
  getBucket(): string { return this.props.bucket; }
  getProvider(): string { return this.props.provider; }
  getMimeType(): string { return this.props.mimeType; }
  getSize(): number { return this.props.size; }
  getOriginalName(): string { return this.props.originalName; }
  getWidth(): number | null { return this.props.width; }
  getHeight(): number | null { return this.props.height; }
  getVisibility(): 'public' | 'private' { return this.props.visibility; }
  getStatus(): string { return this.props.status; }
  getChecksum(): string { return this.props.checksum; }
  getOwnerId(): string | null { return this.props.ownerId; }
  getMetadata(): Record<string, unknown> | null { return this.props.metadata; }

  isActive(): boolean { return this.props.status === 'active'; }
  isDeleted(): boolean { return this.props.status === 'deleted'; }

  markActive(): void {
    this.props.status = 'active';
    this.markAsUpdated();
  }

  markDeleted(): void {
    this.props.status = 'deleted';
    this.markAsUpdated();
  }

  toPlainObject(): Record<string, unknown> {
    return {
      id: this.id,
      storageKey: this.props.storageKey,
      bucket: this.props.bucket,
      provider: this.props.provider,
      mimeType: this.props.mimeType,
      size: this.props.size,
      originalName: this.props.originalName,
      width: this.props.width,
      height: this.props.height,
      visibility: this.props.visibility,
      status: this.props.status,
      checksum: this.props.checksum,
      ownerId: this.props.ownerId,
      metadata: this.props.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.version,
    };
  }
}
