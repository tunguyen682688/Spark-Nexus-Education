import { Command } from '@nestjs/cqrs';
import { CollectionReport } from '@prisma/client';

export class SaveReportCommand extends Command<CollectionReport> {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string,
    public readonly reason?: string
  ) {
    super();
  }
}
