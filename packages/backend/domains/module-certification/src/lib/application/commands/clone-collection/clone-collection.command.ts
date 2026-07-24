import { Command } from '@nestjs/cqrs';

export class CloneCollectionCommand extends Command<{ cloned: boolean; newCollectionId: string }> {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string
  ) {
    super();
  }
}
