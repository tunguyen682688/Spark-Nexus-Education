import { Command } from '@nestjs/cqrs';

export class DeleteDownloadCommand extends Command<{ deleted: boolean }> {
  constructor(public readonly downloadId: string) {
    super();
  }
}
