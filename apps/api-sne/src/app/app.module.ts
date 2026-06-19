import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';

// module import
import { InfrastructureAuthModule } from '@spark-nest-ed/infrastructure-auth';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';
import { UserModule } from '@spark-nest-ed/module-user';
import { VocabularyModule } from '@spark-nest-ed/module-vocabulary';
import { GrammarModule } from '@spark-nest-ed/module-grammar';
import { ReadingModule } from '@spark-nest-ed/module-reading';
import { ListeningModule } from '@spark-nest-ed/module-listening';

@Module({
  imports: [
    VocabularyModule,
    UserModule,
    GrammarModule,
    ReadingModule,
    ListeningModule,
    InfrastructureAuthModule,
    InfrastructureDatabaseModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        ...(process.env.REDIS_PASSWORD &&
        process.env.REDIS_PASSWORD.trim() !== ''
          ? { password: process.env.REDIS_PASSWORD }
          : {}),
        ...(process.env.REDIS_TLS === 'true'
          ? {
              tls: {
                // For cloud Redis, you may need to set rejectUnauthorized: false
                // if using self-signed certificates (not recommended for production)
                rejectUnauthorized:
                  process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
                // Some cloud providers require servername
                ...(process.env.REDIS_TLS_SERVERNAME
                  ? { servername: process.env.REDIS_TLS_SERVERNAME }
                  : {}),
              },
            }
          : {}),
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
