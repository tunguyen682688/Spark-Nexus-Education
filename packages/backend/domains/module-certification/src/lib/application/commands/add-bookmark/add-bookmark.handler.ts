import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { AddBookmarkCommand } from './add-bookmark.command';

@CommandHandler(AddBookmarkCommand)
export class AddBookmarkCommandHandler
  implements ICommandHandler<AddBookmarkCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: AddBookmarkCommand): Promise<{ bookmarked: boolean }> {
    const collection = await this.repository.findCollectionById(command.collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${command.collectionId} not found`);
    }

    await this.repository.saveBookmark({
      userId: command.userId,
      collectionId: command.collectionId,
    });

    return { bookmarked: true };
  }
}
