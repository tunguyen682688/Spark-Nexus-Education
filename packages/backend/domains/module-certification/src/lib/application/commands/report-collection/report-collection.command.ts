import { Command } from '@nestjs/cqrs';

export class ReportCollectionCommand extends Command<{ reported: boolean }> {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string,
    public readonly reason: string
  ) {
    super();
  }
}
