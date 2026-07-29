import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { SaveCollectionCommand } from './save-collection.command';

@CommandHandler(SaveCollectionCommand)
export class SaveCollectionCommandHandler implements ICommandHandler<SaveCollectionCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: SaveCollectionCommand) {
    const { collectionId, userId } = command;

    const existing = await this.repository.findBookmarkByUserAndCollection(userId, collectionId);
    if (existing) {
      await this.repository.deleteBookmark(userId, collectionId);
      return { saved: false, collectionId };
    }

    await this.repository.saveBookmark({ userId, collectionId });
    return { saved: true, collectionId };
  }
}
