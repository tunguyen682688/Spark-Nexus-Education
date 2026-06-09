import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UpvoteCrowdsourcedQuizCommand } from './upvote-crowdsourced-quiz.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { GRAMMAR_COMMUNITY_REPOSITORY } from '../../../domain/repositories/grammar-community.repository.interface';
import type { IGrammarCommunityRepository } from '../../../domain/repositories/grammar-community.repository.interface';
import { CrowdsourcedQuizApprovedEvent } from '../../../domain/events/crowdsourced-quiz-approved.event';

@CommandHandler(UpvoteCrowdsourcedQuizCommand)
export class UpvoteCrowdsourcedQuizHandler implements ICommandHandler<UpvoteCrowdsourcedQuizCommand, any> {
  constructor(
    @Inject(GRAMMAR_COMMUNITY_REPOSITORY)
    private readonly communityRepository: IGrammarCommunityRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: UpvoteCrowdsourcedQuizCommand): Promise<any> {
    const { quizId } = command;
    const quiz = await this.communityRepository.findCrowdsourcedQuizById(quizId);

    if (!quiz) {
      throw new NotFoundException(`Không tìm thấy câu hỏi đóng góp ID: ${quizId}`);
    }

    const newUpvotes = quiz.upvotes + 1;
    let newStatus = quiz.status;
    let isApprovedNow = false;

    if (newUpvotes >= 10 && quiz.status === 'PENDING') {
      newStatus = 'APPROVED';
      isApprovedNow = true;
    }

    const updated = await this.communityRepository.upvoteCrowdsourcedQuiz(quizId, newUpvotes, newStatus);

    if (isApprovedNow) {
      // Fire event to award XP and notify
      await this.eventBus.publish(new CrowdsourcedQuizApprovedEvent(quizId, quiz.contributorId, 50));
    }

    return {
      success: true,
      upvotes: updated.upvotes,
      status: updated.status,
    };
  }
}
