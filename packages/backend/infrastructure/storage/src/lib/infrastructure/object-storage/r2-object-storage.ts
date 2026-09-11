import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IObjectStorage, PresignedUploadResult, PresignedDownloadResult, CopyResult } from '../../domain/object-storage.interface';

@Injectable()
export class R2ObjectStorage implements IObjectStorage {
  private readonly logger = new Logger(R2ObjectStorage.name);
  private readonly client: S3Client;
  private readonly bucketPrimary: string;
  private readonly publicUrl: string;
  private readonly endpoint: string;

  constructor(private readonly config: ConfigService) {
    this.endpoint = this.config.get<string>('R2_ENDPOINT', '');
    this.bucketPrimary = this.config.get<string>('R2_BUCKET_PRIMARY', 'spark-nexus-media');
    this.publicUrl = this.config.get<string>('R2_PUBLIC_URL', '');

    this.client = new S3Client({
      region: 'auto',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.config.get<string>('R2_ACCESS_KEY_ID', ''),
        secretAccessKey: this.config.get<string>('R2_SECRET_ACCESS_KEY', ''),
      },
    });

    this.logger.log(`R2 initialized: endpoint=${this.endpoint}, bucket=${this.bucketPrimary}`);
  }

  async getPresignedUploadUrl(params: {
    storageKey: string;
    contentType: string;
    contentLength: number;
    visibility: 'public' | 'private';
  }): Promise<PresignedUploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucketPrimary,
      Key: params.storageKey,
      ContentType: params.contentType,
      ContentLength: params.contentLength,
      ACL: params.visibility === 'public' ? 'public-read' : 'private',
    });

    const url = await getSignedUrl(this.client, command, { expiresIn: 300 });
    const expiresAt = new Date(Date.now() + 300_000);

    this.logger.debug(`Presigned upload URL generated: key=${params.storageKey}`);
    return { uploadUrl: url, storageKey: params.storageKey, expiresAt };
  }

  getPublicUrl(storageKey: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${storageKey}`;
    }
    return `${this.endpoint}/${this.bucketPrimary}/${storageKey}`;
  }

  async getSignedDownloadUrl(storageKey: string, expiresIn = 3600): Promise<PresignedDownloadResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucketPrimary,
      Key: storageKey,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return { url, expiresAt };
  }

  async head(storageKey: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.bucketPrimary,
        Key: storageKey,
      }));
      return true;
    } catch {
      return false;
    }
  }

  async delete(storageKey: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucketPrimary,
      Key: storageKey,
    }));
    this.logger.debug(`File deleted: key=${storageKey}`);
  }

  async copy(sourceKey: string, sourceBucket: string, destKey: string, destBucket: string): Promise<CopyResult> {
    await this.client.send(new CopyObjectCommand({
      Bucket: destBucket,
      CopySource: `${sourceBucket}/${sourceKey}`,
      Key: destKey,
    }));
    this.logger.debug(`File copied: ${sourceBucket}/${sourceKey} → ${destBucket}/${destKey}`);
    return { storageKey: destKey, bucket: destBucket };
  }
}
