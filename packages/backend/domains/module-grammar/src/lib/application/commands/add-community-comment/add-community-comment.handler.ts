import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddCommunityCommentCommand } from './add-community-comment.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_COMMUNITY_REPOSITORY } from '../../../domain/repositories/grammar-community.repository.interface';
import type { IGrammarCommunityRepository } from '../../../domain/repositories/grammar-community.repository.interface';

@CommandHandler(AddCommunityCommentCommand)
export class AddCommunityCommentHandler implements ICommandHandler<AddCommunityCommentCommand, any> {
  constructor(
    @Inject(GRAMMAR_COMMUNITY_REPOSITORY)
    private readonly communityRepository: IGrammarCommunityRepository
  ) {}

  async execute(command: AddCommunityCommentCommand): Promise<any> {
    const { userId, postId, content } = command;
    const comment = await this.communityRepository.addComment(userId, postId, content);

    return {
      success: true,
      data: comment,
    };
  }
}
