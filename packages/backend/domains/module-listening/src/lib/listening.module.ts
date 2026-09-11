import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';
import { InfrastructureCacheModule } from '@spark-nest-ed/infrastructure-cache';

// Controller
import { ListeningController } from './presentation/controllers/listening.controller';

// Query Handlers
import { GetListeningMaterialsQueryHandler } from './application/querys/get-materials/get-materials.handler';
import { GetListeningMaterialDetailQueryHandler } from './application/querys/get-material-detail/get-material-detail.handler';
import { GetUserStatsQueryHandler } from './application/querys/get-user-stats/get-user-stats.handler';
import { GetWeeklyActivityQueryHandler } from './application/querys/get-weekly-activity/get-weekly-activity.handler';
import { GetListeningLeaderboardQueryHandler } from './application/querys/get-leaderboard/get-leaderboard.handler';

// Command Handlers
import { UpdateListeningProgressCommandHandler } from './application/commands/update-progress/update-progress.handler';
import { VoteListeningMaterialCommandHandler } from './application/commands/vote-material/vote-material.handler';
import { CreateListeningMaterialCommandHandler } from './application/commands/create-material/create-material.handler';
import { ToggleListeningBookmarkCommandHandler } from './application/commands/toggle-bookmark/toggle-bookmark.handler';

// Repositories
import { LISTENING_REPOSITORY } from './domain/repositories/listening.repository.interface';
import { ListeningRepository } from './infrastructure/repositories/listening.repository';

// Cache
import { ListeningCacheService } from './infrastructure/cache/listening-cache.service';

// Services
import { ListeningService } from './domain/services/listening.service';

// Saga & Processor
import { ListeningSaga } from './domain/sagas/listening.saga';
import { ListeningProcessor } from './infrastructure/processors/listening.processor';

@Module({
  imports: [
    CqrsModule,
    InfrastructureDatabaseModule,
    InfrastructureCacheModule,
    // No BullModule — using BullMQService instead (1 shared connection)
  ],
  controllers: [ListeningController],
  providers: [
    ListeningCacheService,
    ListeningService,
    GetListeningMaterialsQueryHandler,
    GetListeningMaterialDetailQueryHandler,
    GetUserStatsQueryHandler,
    GetWeeklyActivityQueryHandler,
    GetListeningLeaderboardQueryHandler,
    UpdateListeningProgressCommandHandler,
    VoteListeningMaterialCommandHandler,
    CreateListeningMaterialCommandHandler,
    ToggleListeningBookmarkCommandHandler,
    {
      provide: LISTENING_REPOSITORY,
      useClass: ListeningRepository,
    },
    ListeningSaga,
    ListeningProcessor,
  ],
  exports: [CqrsModule, LISTENING_REPOSITORY, ListeningService],
})
export class ListeningModule {}
