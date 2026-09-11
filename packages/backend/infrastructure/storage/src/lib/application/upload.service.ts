import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import type { IObjectStorage } from '../domain/object-storage.interface';
import { MediaFileEntity } from '../domain/media-file.entity';
import type { IMediaFileRepository } from '../domain/media-file.repository.interface';
import { MEDIA_FILE_REPOSITORY } from '../domain/media-file.repository.interface';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES];

export interface RequestUploadParams {
  fileName: string;
  contentType: string;
  contentLength: number;
  visibility: 'public' | 'private';
  ownerId: string;
}

export interface RequestUploadResult {
  uploadUrl: string;
  mediaFileId: string;
  storageKey: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly maxFileSize: number;
  private readonly allowedTypes: string[];
  private readonly bucketPrimary: string;

  constructor(
    @Inject('IObjectStorage') private readonly objectStorage: IObjectStorage,
    @Inject(MEDIA_FILE_REPOSITORY) private readonly repo: IMediaFileRepository,
    private readonly config: ConfigService,
  ) {
    this.maxFileSize = this.config.get<number>('UPLOAD_MAX_SIZE_MB', 10) * 1024 * 1024;
    this.allowedTypes = this.config.get<string>('UPLOAD_ALLOWED_MIME', ALLOWED_TYPES.join(',')).split(',');
    this.bucketPrimary = this.config.get<string>('R2_BUCKET_PRIMARY', 'spark-nexus-media');
  }

  /** Step 1: Client requests presigned upload URL */
  async requestUpload(params: RequestUploadParams): Promise<RequestUploadResult> {
    // 1. Validate
    this.validateFile(params);

    // 2. Generate server-controlled storageKey
    const ext = this.getExtension(params.fileName, params.contentType);
    const uuid = crypto.randomUUID();
    const storageKey = `media/${uuid}.${ext}`;

    // 3. Create MediaFile record (status: processing)
    const mediaFile = await this.repo.create({
      storageKey,
      bucket: this.bucketPrimary,
      provider: 'r2',
      mimeType: params.contentType,
      size: params.contentLength,
      originalName: params.fileName,
      visibility: params.visibility,
      status: 'processing',
      checksum: '', // Will be updated after upload
      ownerId: params.ownerId,
    });

    // 4. Get presigned URL
    const presigned = await this.objectStorage.getPresignedUploadUrl({
      storageKey,
      contentType: params.contentType,
      contentLength: params.contentLength,
      visibility: params.visibility,
    });

    this.logger.log(`Upload requested: id=${mediaFile.id}, key=${storageKey}, size=${params.contentLength}`);

    return {
      uploadUrl: presigned.uploadUrl,
      mediaFileId: mediaFile.id,
      storageKey,
    };
  }

  /** Step 2: Client confirms upload complete */
  async confirmUpload(mediaFileId: string): Promise<MediaFileEntity> {
    const mediaFile = await this.repo.findById(mediaFileId);
    if (!mediaFile) {
      throw new BadRequestException(`MediaFile ${mediaFileId} not found`);
    }

    // Verify file exists in R2
    const exists = await this.objectStorage.head(mediaFile.getStorageKey());
    if (!exists) {
      throw new BadRequestException(`File not found in storage for key ${mediaFile.getStorageKey()}`);
    }

    // Mark active
    mediaFile.markActive();
    await this.repo.updateStatus(mediaFileId, 'active');

    this.logger.log(`Upload confirmed: id=${mediaFileId}, key=${mediaFile.getStorageKey()}`);
    return mediaFile;
  }

  /** Get file URL for display */
  getFileUrl(mediaFile: MediaFileEntity): string {
    if (mediaFile.getVisibility() === 'public') {
      return this.objectStorage.getPublicUrl(mediaFile.getStorageKey());
    }
    // Private: caller should use getPrivateFileUrl
    return this.objectStorage.getPublicUrl(mediaFile.getStorageKey());
  }

  /** Get signed URL for private files */
  async getPrivateFileUrl(mediaFile: MediaFileEntity): Promise<string> {
    const result = await this.objectStorage.getSignedDownloadUrl(mediaFile.getStorageKey());
    return result.url;
  }

  /** Soft delete file */
  async deleteFile(mediaFileId: string): Promise<void> {
    await this.repo.softDelete(mediaFileId);
    this.logger.log(`File soft-deleted: id=${mediaFileId}`);
  }

  /** Hard delete — removes from storage + DB (for expired soft-deletes) */
  async hardDeleteFile(mediaFile: MediaFileEntity): Promise<void> {
    await this.objectStorage.delete(mediaFile.getStorageKey());
    await this.repo.hardDelete(mediaFile.id);
    this.logger.log(`File hard-deleted: id=${mediaFile.id}, key=${mediaFile.getStorageKey()}`);
  }

  private validateFile(params: RequestUploadParams): void {
    if (params.contentLength > this.maxFileSize) {
      throw new BadRequestException(`File size ${params.contentLength} exceeds max ${this.maxFileSize}`);
    }
    if (!this.allowedTypes.includes(params.contentType)) {
      throw new BadRequestException(`Content type ${params.contentType} not allowed`);
    }
  }

  private getExtension(fileName: string, contentType: string): string {
    // Prefer extension from filename
    const fromName = fileName.split('.').pop()?.toLowerCase();
    if (fromName && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp3', 'wav', 'ogg', 'mp4'].includes(fromName)) {
      return fromName === 'jpg' ? 'jpg' : fromName;
    }
    // Fallback from MIME type
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/mp4': 'm4a',
    };
    return mimeMap[contentType] || 'bin';
  }
}
