import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { DeleteCollectionCommand } from './delete-collection.command';

@CommandHandler(DeleteCollectionCommand)
export class DeleteCollectionCommandHandler implements ICommandHandler<DeleteCollectionCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: DeleteCollectionCommand) {
    const { collectionId, userId } = command;

    const existing = await this.repository.findCollectionById(collectionId);
    if (!existing) {
      throw new NotFoundException(`Collection ${collectionId} not found`);
    }
    if (existing.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only delete your own collections');
    }

    await this.repository.deleteCollection(collectionId);

    return { deleted: true };
  }
}
