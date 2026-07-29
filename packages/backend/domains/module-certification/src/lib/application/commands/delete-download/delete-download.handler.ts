import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { DeleteDownloadCommand } from './delete-download.command';

@CommandHandler(DeleteDownloadCommand)
export class DeleteDownloadCommandHandler
  implements ICommandHandler<DeleteDownloadCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: DeleteDownloadCommand): Promise<{ deleted: boolean }> {
    await this.repository.deleteDownload(command.downloadId);
    return { deleted: true };
  }
}
