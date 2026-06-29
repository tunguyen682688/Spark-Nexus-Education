import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';

@Module({
  imports: [
    CqrsModule.forRoot(),
    InfrastructureDatabaseModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CertificationModule {}
