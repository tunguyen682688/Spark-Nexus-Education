import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { SyncUserCommand } from './sync-user.command';

@CommandHandler(SyncUserCommand)
export class SyncUserHandler implements ICommandHandler<SyncUserCommand, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: any
  ) {}

  async execute(command: SyncUserCommand): Promise<User> {
    return this.userRepository.upsert({
      id: command.id,
      email: command.email,
      name: command.name,
      picture: command.picture,
      role: command.role,
    });
  }
}
