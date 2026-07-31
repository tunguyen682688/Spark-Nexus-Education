import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { UpdateCollectionCommand } from './update-collection.command';

@CommandHandler(UpdateCollectionCommand)
export class UpdateCollectionCommandHandler implements ICommandHandler<UpdateCollectionCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: UpdateCollectionCommand) {
    const {
      collectionId,
      userId,
      title,
      description,
      subtitle,
      level,
      tags,
      visibility,
      allowDownloads,
      coverImage,
      publishStatus
    } = command;

    const existing = await this.repository.findCollectionById(collectionId);
    if (!existing) {
      throw new NotFoundException(`Collection ${collectionId} not found`);
    }
    if (existing.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only edit your own collections');
    }

    existing.update({
      title,
      description,
      subtitle,
      level,
      tags,
      visibility,
      allowDownloads,
      coverImage,
      publishStatus,
      updatedBy: userId,
    });

    await this.repository.saveCollection(existing);

    return { id: collectionId };
  }
}
