import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IObjectStorage } from '../../domain/object-storage.interface';
import { R2ObjectStorage } from './r2-object-storage';
import { LocalObjectStorage } from './local-object-storage';

@Injectable()
export class ObjectStorageFactory {
  private readonly logger = new Logger(ObjectStorageFactory.name);
  private readonly provider: IObjectStorage;

  constructor(private readonly config: ConfigService) {
    const driver = this.config.get<string>('STORAGE_DRIVER', 'local');

    if (driver === 'r2' && this.config.get<string>('R2_ACCESS_KEY_ID')) {
      this.provider = new R2ObjectStorage(this.config);
      this.logger.log('Storage provider: R2 (Cloudflare)');
    } else {
      this.provider = new LocalObjectStorage();
      this.logger.log('Storage provider: Local filesystem (dev)');
    }
  }

  getProvider(): IObjectStorage {
    return this.provider;
  }
}
