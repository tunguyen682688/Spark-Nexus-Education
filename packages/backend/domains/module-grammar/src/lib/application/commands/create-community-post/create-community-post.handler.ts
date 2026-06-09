import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateCommunityPostCommand } from './create-community-post.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_COMMUNITY_REPOSITORY } from '../../../domain/repositories/grammar-community.repository.interface';
import type { IGrammarCommunityRepository } from '../../../domain/repositories/grammar-community.repository.interface';
import { CommunityPostCreatedEvent } from '../../../domain/events/community-post-created.event';

@CommandHandler(CreateCommunityPostCommand)
export class CreateCommunityPostHandler implements ICommandHandler<CreateCommunityPostCommand, any> {
  constructor(
    @Inject(GRAMMAR_COMMUNITY_REPOSITORY)
    private readonly communityRepository: IGrammarCommunityRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateCommunityPostCommand): Promise<any> {
    const { userId, dto } = command;
    const post = await this.communityRepository.createPost(userId, dto);

    // Publish event
    await this.eventBus.publish(new CommunityPostCreatedEvent(post.id, userId));

    return {
      success: true,
      data: post,
    };
  }
}
