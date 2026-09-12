import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OnModuleInit } from '@nestjs/common';
import { S3Client, CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Inject } from '@nestjs/common';
import { MEDIA_FILE_REPOSITORY } from '../../domain/media-file.repository.interface';
import type { IMediaFileRepository } from '../../domain/media-file.repository.interface';
import { BullMQService } from '@spark-nest-ed/infrastructure-cache';

interface BackupJobData {
  mediaFileId: string;
  storageKey: string;
  bucketSource: string;
  bucketBackup: string;
  mimeType: string;
}

export class B2BackupService implements OnModuleInit {
  private readonly logger = new Logger(B2BackupService.name);
  private readonly b2Client: S3Client | null = null;
  private readonly enabled: boolean;

  constructor(
    @Inject(MEDIA_FILE_REPOSITORY) private readonly repo: IMediaFileRepository,
    private readonly bullMQ: BullMQService,
  ) {
    const keyId = process.env.B2_KEY_ID;
    const appKey = process.env.B2_APP_KEY;

    if (!keyId || !appKey) {
      this.enabled = false;
      this.logger.warn(
        'B2BackupService disabled: B2_KEY_ID and B2_APP_KEY not set. ' +
        'Media backup to B2 will not run.'
      );
    } else {
      this.enabled = true;
      this.b2Client = new S3Client({
        region: 'us-east-005',
        endpoint: 'https://us-east-005.backblazeb2.com',
        credentials: {
          accessKeyId: keyId,
          secretAccessKey: appKey,
        },
      });
    }
  }

  onModuleInit() {
    if (this.enabled) {
      this.bullMQ.registerWorker('media-backup', (job) => this.process(job as Job<BackupJobData>));
    }
  }

  private async process(job: Job<BackupJobData>): Promise<void> {
    if (!this.b2Client) return;

    const { storageKey, bucketSource, bucketBackup } = job.data;

    this.logger.log(`Starting B2 backup: key=${storageKey}`);

    try {
      const alreadyBacked = await this.existsInB2(bucketBackup, storageKey);
      if (alreadyBacked) {
        this.logger.log(`Already backed up, skipping: key=${storageKey}`);
        await this.repo.updateStatus(job.data.mediaFileId, 'active');
        return;
      }

      await this.b2Client.send(new CopyObjectCommand({
        Bucket: bucketBackup,
        CopySource: `${bucketSource}/${storageKey}`,
        Key: storageKey,
      }));

      this.logger.log(`B2 backup completed: key=${storageKey}`);
      await this.repo.updateStatus(job.data.mediaFileId, 'active');
    } catch (error) {
      this.logger.error(`B2 backup failed: key=${storageKey}, error=${error}`);
      throw error;
    }
  }

  private async existsInB2(bucket: string, key: string): Promise<boolean> {
    if (!this.b2Client) return false;

    try {
      await this.b2Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}
