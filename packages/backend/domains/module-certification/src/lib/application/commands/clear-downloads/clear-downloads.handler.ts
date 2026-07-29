import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { ClearDownloadsCommand } from './clear-downloads.command';

@CommandHandler(ClearDownloadsCommand)
export class ClearDownloadsCommandHandler
  implements ICommandHandler<ClearDownloadsCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: ClearDownloadsCommand): Promise<{ cleared: boolean }> {
    await this.repository.deleteAllDownloads(command.userId);
    return { cleared: true };
  }
}
