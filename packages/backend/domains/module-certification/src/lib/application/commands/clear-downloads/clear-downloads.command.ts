import { Command } from '@nestjs/cqrs';

export class ClearDownloadsCommand extends Command<{ cleared: boolean }> {
  constructor(public readonly userId: string) {
    super();
  }
}
