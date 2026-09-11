import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { IObjectStorage, PresignedUploadResult, PresignedDownloadResult, CopyResult } from '../../domain/object-storage.interface';

/**
 * Local filesystem storage — dev mode only.
 * NOT for production — use R2ObjectStorage.
 */
@Injectable()
export class LocalObjectStorage implements IObjectStorage {
  private readonly logger = new Logger(LocalObjectStorage.name);
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.publicBaseUrl = process.env.UPLOAD_PUBLIC_URL || '/uploads';

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    this.logger.log(`Local storage initialized: dir=${this.uploadDir}`);
  }

  async getPresignedUploadUrl(params: {
    storageKey: string;
    contentType: string;
    contentLength: number;
    visibility: 'public' | 'private';
  }): Promise<PresignedUploadResult> {
    const uploadUrl = `${process.env.API_URL || 'http://localhost:3000'}/api/v1/upload/local/${params.storageKey}`;
    const expiresAt = new Date(Date.now() + 300_000);
    return { uploadUrl, storageKey: params.storageKey, expiresAt };
  }

  getPublicUrl(storageKey: string): string {
    return `${this.publicBaseUrl}/${storageKey}`;
  }

  async getSignedDownloadUrl(storageKey: string, expiresIn = 3600): Promise<PresignedDownloadResult> {
    return {
      url: this.getPublicUrl(storageKey),
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }

  async head(storageKey: string): Promise<boolean> {
    return fs.existsSync(path.join(this.uploadDir, storageKey));
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.debug(`Local file deleted: ${storageKey}`);
    }
  }

  async copy(sourceKey: string, sourceBucket: string, destKey: string, destBucket: string): Promise<CopyResult> {
    const srcPath = path.join(this.uploadDir, sourceKey);
    const destPath = path.join(this.uploadDir, destKey);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
    return { storageKey: destKey, bucket: destBucket };
  }

  /** Write buffer to local disk (called by upload endpoint) */
  async writeBuffer(storageKey: string, buffer: Buffer): Promise<void> {
    const filePath = path.join(this.uploadDir, storageKey);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);
    this.logger.debug(`Local file written: ${storageKey} (${buffer.length} bytes)`);
  }
}
