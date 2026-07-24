import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { SaveCollectionCommand } from './save-collection.command';

@CommandHandler(SaveCollectionCommand)
export class SaveCollectionCommandHandler
  implements ICommandHandler<SaveCollectionCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: SaveCollectionCommand): Promise<{ saved: boolean }> {
    const collection = await this.repository.findCollectionById(command.collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${command.collectionId} not found`);
    }

    return { saved: true };
  }
}
