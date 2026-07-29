import { Command } from '@nestjs/cqrs';

export class RemoveBookmarkCommand extends Command<{ removed: boolean }> {
  constructor(
    public readonly userId: string,
    public readonly collectionId: string
  ) {
    super();
  }
}
