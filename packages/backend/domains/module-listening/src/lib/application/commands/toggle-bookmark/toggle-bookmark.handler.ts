import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ToggleListeningBookmarkCommand } from './toggle-bookmark.command';
import { ListeningService } from '../../../domain/services/listening.service';

@CommandHandler(ToggleListeningBookmarkCommand)
export class ToggleListeningBookmarkCommandHandler implements ICommandHandler<ToggleListeningBookmarkCommand> {
  constructor(
    private readonly listeningService: ListeningService
  ) {}

  async execute(command: ToggleListeningBookmarkCommand) {
    const { materialId, userId } = command;
    return this.listeningService.toggleBookmark(userId, materialId);
  }
}
