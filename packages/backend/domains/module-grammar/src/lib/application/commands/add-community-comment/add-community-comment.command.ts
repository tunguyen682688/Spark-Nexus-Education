import { Command } from '@nestjs/cqrs';

export class AddCommunityCommentCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly postId: string,
    public readonly content: string
  ) {
    super();
  }
}
