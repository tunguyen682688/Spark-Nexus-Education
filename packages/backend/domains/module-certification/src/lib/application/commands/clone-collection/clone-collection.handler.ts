import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { CloneCollectionCommand } from './clone-collection.command';

@CommandHandler(CloneCollectionCommand)
export class CloneCollectionCommandHandler
  implements ICommandHandler<CloneCollectionCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: CloneCollectionCommand): Promise<{ cloned: boolean; newCollectionId: string }> {
    const original = await this.repository.findCollectionById(command.collectionId);
    if (!original) {
      throw new NotFoundException(`Collection with ID ${command.collectionId} not found`);
    }

    const clonedId = `clone-${Date.now()}-${command.collectionId}`;
    return {
      cloned: true,
      newCollectionId: clonedId,
    };
  }
}
