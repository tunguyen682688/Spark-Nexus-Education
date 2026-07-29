import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { RemoveBookmarkCommand } from './remove-bookmark.command';

@CommandHandler(RemoveBookmarkCommand)
export class RemoveBookmarkCommandHandler
  implements ICommandHandler<RemoveBookmarkCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: RemoveBookmarkCommand): Promise<{ removed: boolean }> {
    const existing = await this.repository.findBookmarkByUserAndCollection(
      command.userId,
      command.collectionId
    );
    if (!existing) {
      throw new NotFoundException(
        `Bookmark not found for user ${command.userId} and collection ${command.collectionId}`
      );
    }

    await this.repository.deleteBookmark(command.userId, command.collectionId);

    return { removed: true };
  }
}
