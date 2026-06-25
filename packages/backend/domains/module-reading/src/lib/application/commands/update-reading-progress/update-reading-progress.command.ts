import { ICommand } from '@nestjs/cqrs';

export class UpdateReadingProgressCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly articleId: string,
    public readonly progress: number,
    public readonly lastPosition: number,
    public readonly timeSpent: number
  ) {}
}
