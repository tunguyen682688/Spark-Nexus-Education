export interface PresignedUploadResult {
  uploadUrl: string;
  storageKey: string;
  expiresAt: Date;
}

export interface PresignedDownloadResult {
  url: string;
  expiresAt: Date;
}

export interface CopyResult {
  storageKey: string;
  bucket: string;
}

export interface IObjectStorage {
  /** Generate presigned URL for client direct upload */
  getPresignedUploadUrl(params: {
    storageKey: string;
    contentType: string;
    contentLength: number;
    visibility: 'public' | 'private';
  }): Promise<PresignedUploadResult>;

  /** Get public URL (CDN) for public files */
  getPublicUrl(storageKey: string): string;

  /** Get short-lived signed URL for private files */
  getSignedDownloadUrl(storageKey: string, expiresIn?: number): Promise<PresignedDownloadResult>;

  /** Check if file exists */
  head(storageKey: string): Promise<boolean>;

  /** Delete file from storage */
  delete(storageKey: string): Promise<void>;

  /** Copy file between buckets (for backup) */
  copy(sourceKey: string, sourceBucket: string, destKey: string, destBucket: string): Promise<CopyResult>;
}
