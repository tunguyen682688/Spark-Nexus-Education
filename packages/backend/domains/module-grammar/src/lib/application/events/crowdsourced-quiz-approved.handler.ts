import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GRAMMAR_STREAK_REPOSITORY } from '../../domain/repositories/grammar-streak.repository.interface';
import type { IGrammarStreakRepository } from '../../domain/repositories/grammar-streak.repository.interface';
import { CrowdsourcedQuizApprovedEvent } from '../../domain/events/crowdsourced-quiz-approved.event';

@EventsHandler(CrowdsourcedQuizApprovedEvent)
export class CrowdsourcedQuizApprovedHandler implements IEventHandler<CrowdsourcedQuizApprovedEvent> {
  private readonly logger = new Logger(CrowdsourcedQuizApprovedHandler.name);

  constructor(
    @Inject(GRAMMAR_STREAK_REPOSITORY)
    private readonly streakRepository: IGrammarStreakRepository
  ) {}

  async handle(event: CrowdsourcedQuizApprovedEvent): Promise<void> {
    const { contributorId, xpReward, quizId } = event;
    this.logger.log(`Awarding ${xpReward} XP to contributor ${contributorId} because quiz ${quizId} was approved.`);
    await this.streakRepository.incrementXP(contributorId, xpReward);
  }
}
