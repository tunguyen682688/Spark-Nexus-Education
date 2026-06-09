import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';

// ===== REPOSITORY IMPLEMENTATIONS =====
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { UserRepository } from './infrastructure/repositories/user.repository';

// ===== CONTROLLERS =====
import { UserController } from './presentation/controllers/user.controller';

// ===== CQRS HANDLERS =====
import { SyncUserHandler } from './application/commands/sync-user/sync-user.handler';
import { GetUserProfileHandler } from './application/queries/get-user-profile/get-user-profile.handler';
import { GetUsersProfilesHandler } from './application/queries/get-users-profiles/get-users-profiles.handler';

@Module({
  imports: [
    CqrsModule,
    InfrastructureDatabaseModule, // Cung cấp PrismaService
  ],
  controllers: [UserController],
  providers: [
    // CQRS Command Handlers
    SyncUserHandler,

    // CQRS Query Handlers
    GetUserProfileHandler,
    GetUsersProfilesHandler,

    // Wire repository interface to concrete class
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [
    USER_REPOSITORY,
  ],
})
export class UserModule {}
