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
    const bookmark = await this.repository.findBookmarkById(command.bookmarkId);
    if (!bookmark) {
      throw new NotFoundException(`Bookmark with ID ${command.bookmarkId} not found`);
    }
    if (bookmark.userId !== command.userId) {
      throw new NotFoundException(`Bookmark with ID ${command.bookmarkId} not found`);
    }

    await this.repository.deleteBookmark(command.userId, bookmark.collectionId);

    return { removed: true };
  }
}
