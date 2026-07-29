import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { CloneCollectionCommand } from './clone-collection.command';

@CommandHandler(CloneCollectionCommand)
export class CloneCollectionCommandHandler implements ICommandHandler<CloneCollectionCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: CloneCollectionCommand) {
    const { collectionId, userId } = command;

    const cloned = await this.repository.cloneCollection(collectionId, userId);
    return { cloned: true, newCollectionId: cloned.id };
  }
}
