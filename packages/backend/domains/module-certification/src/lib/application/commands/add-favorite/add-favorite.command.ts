import { Command } from '@nestjs/cqrs';

export class AddFavoriteCommand extends Command<{ favorited: boolean }> {
  constructor(
    public readonly userId: string,
    public readonly collectionId: string
  ) {
    super();
  }
}
