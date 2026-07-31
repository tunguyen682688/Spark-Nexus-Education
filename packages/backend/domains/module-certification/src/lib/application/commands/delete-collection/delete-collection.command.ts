import { Command } from '@nestjs/cqrs';

export class DeleteCollectionCommand extends Command<{ deleted: boolean }> {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string
  ) {
    super();
  }
}
