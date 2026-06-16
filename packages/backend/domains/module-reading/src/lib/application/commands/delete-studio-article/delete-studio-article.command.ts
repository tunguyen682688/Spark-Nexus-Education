import { ICommand } from '@nestjs/cqrs';

export class DeleteStudioArticleCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly articleId: string
  ) {}
}
