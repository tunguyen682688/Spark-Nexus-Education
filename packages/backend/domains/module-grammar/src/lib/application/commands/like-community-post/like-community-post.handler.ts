import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikeCommunityPostCommand } from './like-community-post.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_COMMUNITY_REPOSITORY } from '../../../domain/repositories/grammar-community.repository.interface';
import type { IGrammarCommunityRepository } from '../../../domain/repositories/grammar-community.repository.interface';

@CommandHandler(LikeCommunityPostCommand)
export class LikeCommunityPostHandler implements ICommandHandler<LikeCommunityPostCommand, any> {
  constructor(
    @Inject(GRAMMAR_COMMUNITY_REPOSITORY)
    private readonly communityRepository: IGrammarCommunityRepository
  ) {}

  async execute(command: LikeCommunityPostCommand): Promise<any> {
    const { postId } = command;
    const likesCount = await this.communityRepository.likePost(postId);

    return {
      success: true,
      likesCount,
    };
  }
}
