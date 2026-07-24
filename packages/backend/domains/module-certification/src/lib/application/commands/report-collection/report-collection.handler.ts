import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { ReportCollectionCommand } from './report-collection.command';

@CommandHandler(ReportCollectionCommand)
export class ReportCollectionCommandHandler
  implements ICommandHandler<ReportCollectionCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: ReportCollectionCommand): Promise<{ reported: boolean }> {
    const collection = await this.repository.findCollectionById(command.collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${command.collectionId} not found`);
    }

    return { reported: true };
  }
}
