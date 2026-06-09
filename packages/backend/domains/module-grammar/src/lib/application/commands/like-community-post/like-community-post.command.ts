import { Command } from '@nestjs/cqrs';

export class LikeCommunityPostCommand extends Command<any> {
  constructor(public readonly postId: string) {
    super();
  }
}
