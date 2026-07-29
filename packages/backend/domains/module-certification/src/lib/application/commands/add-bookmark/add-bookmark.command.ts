import { Command } from '@nestjs/cqrs';

export class AddBookmarkCommand extends Command<{ bookmarked: boolean }> {
  constructor(
    public readonly userId: string,
    public readonly collectionId: string
  ) {
    super();
  }
}
