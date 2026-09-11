import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedCacheService } from './shared-cache.service';
import { BullMQService } from './bullmq.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [BullMQService, SharedCacheService],
  exports: [BullMQService, SharedCacheService],
})
export class InfrastructureCacheModule {}
