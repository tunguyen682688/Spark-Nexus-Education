import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';
import { InfrastructureCacheModule } from '@spark-nest-ed/infrastructure-cache';
import { UploadService } from './application/upload.service';
import { MediaCleanupProcessor } from './application/processors/media-cleanup.processor';
import { MediaFileRepository } from './infrastructure/persistence/media-file.repository';
import { ObjectStorageFactory } from './infrastructure/object-storage/object-storage.factory';
import { B2BackupService } from './infrastructure/backup/b2-backup.service';
import { MEDIA_FILE_REPOSITORY } from './domain/media-file.repository.interface';
import { UploadController } from './presentation/upload.controller';

@Global()
@Module({
  imports: [
    ConfigModule,
    InfrastructureDatabaseModule,
    InfrastructureCacheModule,
    // No BullModule — using BullMQService instead (1 shared connection)
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    MediaCleanupProcessor,
    B2BackupService,
    ObjectStorageFactory,
    {
      provide: MEDIA_FILE_REPOSITORY,
      useClass: MediaFileRepository,
    },
    {
      provide: 'IObjectStorage',
      useFactory: (factory: ObjectStorageFactory) => factory.getProvider(),
      inject: [ObjectStorageFactory],
    },
  ],
  exports: [UploadService, MEDIA_FILE_REPOSITORY, 'IObjectStorage'],
})
export class InfrastructureStorageModule {}
