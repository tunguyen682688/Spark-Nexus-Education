import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { CollectionReport } from '@prisma/client';
import { SaveReportCommand } from './save-report.command';

@CommandHandler(SaveReportCommand)
export class SaveReportCommandHandler
  implements ICommandHandler<SaveReportCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: SaveReportCommand): Promise<CollectionReport> {
    const collection = await this.repository.findCollectionById(command.collectionId);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${command.collectionId} not found`);
    }

    return this.repository.saveReport({
      collectionId: command.collectionId,
      userId: command.userId,
      reason: command.reason,
    });
  }
}
