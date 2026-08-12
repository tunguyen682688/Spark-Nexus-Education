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
    const favorite = await this.repository.findFavoriteById(command.favoriteId);
    if (!favorite) {
      throw new NotFoundException(`Favorite with ID ${command.favoriteId} not found`);
    }
    if (favorite.userId !== command.userId) {
      throw new NotFoundException(`Favorite with ID ${command.favoriteId} not found`);
    }

    await this.repository.deleteFavorite(command.userId, favorite.collectionId);

    return { removed: true };
  }
}
