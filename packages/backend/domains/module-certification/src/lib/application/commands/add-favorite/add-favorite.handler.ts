import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { AddFavoriteCommand } from './add-favorite.command';

@CommandHandler(AddFavoriteCommand)
export class AddFavoriteCommandHandler
  implements ICommandHandler<AddFavoriteCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: AddFavoriteCommand): Promise<{ favorited: boolean }> {
    const collection = await this.repository.findCollectionById(command.collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${command.collectionId} not found`);
    }

    await this.repository.saveFavorite({
      userId: command.userId,
      collectionId: command.collectionId,
    });

    return { favorited: true };
  }
}
