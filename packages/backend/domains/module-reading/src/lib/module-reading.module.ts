import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  controllers: [],
  providers: [],
  exports: [CqrsModule],
})
export class ModuleReadingModule {}
