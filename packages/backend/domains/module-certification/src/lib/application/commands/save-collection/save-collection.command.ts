import { Command } from '@nestjs/cqrs';

export class SaveCollectionCommand extends Command<{ saved: boolean }> {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string
  ) {
    super();
  }
}
