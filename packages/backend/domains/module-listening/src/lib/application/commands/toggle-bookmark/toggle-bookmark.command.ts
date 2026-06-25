import { ICommand } from '@nestjs/cqrs';

export class ToggleListeningBookmarkCommand implements ICommand {
  constructor(
    public readonly materialId: string,
    public readonly userId: string
  ) {}
}
