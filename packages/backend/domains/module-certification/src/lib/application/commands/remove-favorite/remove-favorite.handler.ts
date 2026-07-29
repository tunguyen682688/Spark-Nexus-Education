import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { RemoveFavoriteCommand } from './remove-favorite.command';

@CommandHandler(RemoveFavoriteCommand)
export class RemoveFavoriteCommandHandler
  implements ICommandHandler<RemoveFavoriteCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: RemoveFavoriteCommand): Promise<{ removed: boolean }> {
    const existing = await this.repository.findFavoriteByUserAndCollection(
      command.userId,
      command.collectionId
    );
    if (!existing) {
      throw new NotFoundException(
        `Favorite not found for user ${command.userId} and collection ${command.collectionId}`
      );
    }

    await this.repository.deleteFavorite(command.userId, command.collectionId);

    return { removed: true };
  }
}
