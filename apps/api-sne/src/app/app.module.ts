import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// module import
import { InfrastructureAuthModule } from '@spark-nest-ed/infrastructure-auth';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';
import { InfrastructureStorageModule } from '@spark-nest-ed/infrastructure-storage';
import { InfrastructureCacheModule } from '@spark-nest-ed/infrastructure-cache';
import { UserModule } from '@spark-nest-ed/module-user';
import { VocabularyModule } from '@spark-nest-ed/module-vocabulary';
import { GrammarModule } from '@spark-nest-ed/module-grammar';
import { ReadingModule } from '@spark-nest-ed/module-reading';
import { ListeningModule } from '@spark-nest-ed/module-listening';
import { CertificationModule } from '@spark-nest-ed/module-certification';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VocabularyModule,
    UserModule,
    GrammarModule,
    ReadingModule,
    ListeningModule,
    CertificationModule,
    InfrastructureAuthModule,
    InfrastructureDatabaseModule,
    InfrastructureStorageModule,
    InfrastructureCacheModule,
    // No BullModule — using BullMQService (1 shared Redis connection)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
