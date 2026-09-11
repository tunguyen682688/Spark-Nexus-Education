import { MediaFileEntity } from './media-file.entity';

export const MEDIA_FILE_REPOSITORY = Symbol('MEDIA_FILE_REPOSITORY');

export interface CreateMediaFileData {
  storageKey: string;
  bucket: string;
  provider: string;
  mimeType: string;
  size: number;
  originalName: string;
  width?: number | null;
  height?: number | null;
  visibility: 'public' | 'private';
  status: 'active' | 'deleted' | 'processing';
  checksum: string;
  ownerId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface IMediaFileRepository {
  create(data: CreateMediaFileData): Promise<MediaFileEntity>;
  findById(id: string): Promise<MediaFileEntity | null>;
  findByStorageKey(storageKey: string): Promise<MediaFileEntity | null>;
  findByChecksum(checksum: string): Promise<MediaFileEntity | null>;
  updateStatus(id: string, status: 'active' | 'deleted' | 'processing'): Promise<void>;
  softDelete(id: string): Promise<void>;
  findExpiredSoftDeletes(olderThanDays: number): Promise<MediaFileEntity[]>;
  hardDelete(id: string): Promise<void>;
  countByOwnerId(ownerId: string): Promise<number>;
}
