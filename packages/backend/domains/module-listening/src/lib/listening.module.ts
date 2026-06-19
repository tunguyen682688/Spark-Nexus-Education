import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';

// Controller
import { ListeningController } from './presentation/controllers/listening.controller';

// Query Handlers
import { GetListeningMaterialsQueryHandler } from './application/querys/get-materials/get-materials.handler';
import { GetListeningMaterialDetailQueryHandler } from './application/querys/get-material-detail/get-material-detail.handler';

// Command Handlers
import { UpdateListeningProgressCommandHandler } from './application/commands/update-progress/update-progress.handler';
import { VoteListeningMaterialCommandHandler } from './application/commands/vote-material/vote-material.handler';
import { CreateListeningMaterialCommandHandler } from './application/commands/create-material/create-material.handler';

@Module({
  imports: [
    CqrsModule,
    InfrastructureDatabaseModule,
  ],
  controllers: [
    ListeningController,
  ],
  providers: [
    GetListeningMaterialsQueryHandler,
    GetListeningMaterialDetailQueryHandler,
    UpdateListeningProgressCommandHandler,
    VoteListeningMaterialCommandHandler,
    CreateListeningMaterialCommandHandler,
  ],
  exports: [
    CqrsModule,
  ],
})
export class ListeningModule {}
