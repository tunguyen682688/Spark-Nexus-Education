import { Command } from '@nestjs/cqrs';

export class RemoveFavoriteCommand extends Command<{ removed: boolean }> {
  constructor(
    public readonly userId: string,
    public readonly collectionId: string
  ) {
    super();
  }
}
