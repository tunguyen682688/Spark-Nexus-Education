import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { BreakGrammarTrapCommand } from './break-grammar-trap.command';
import { Inject, NotFoundException } from '@nestjs/common';
import * as grammarTrapRepositoryInterface from '../../../domain/repositories/grammar-trap.repository.interface';
import * as grammarStreakRepositoryInterface from '../../../domain/repositories/grammar-streak.repository.interface';
import { TrapBrokenEvent } from '../../../domain/events/trap-broken.event';

@CommandHandler(BreakGrammarTrapCommand)
export class BreakGrammarTrapHandler
  implements ICommandHandler<BreakGrammarTrapCommand, any>
{
  constructor(
    @Inject(grammarTrapRepositoryInterface.GRAMMAR_TRAP_REPOSITORY)
    private readonly trapRepository: grammarTrapRepositoryInterface.IGrammarTrapRepository,
    @Inject(grammarStreakRepositoryInterface.GRAMMAR_STREAK_REPOSITORY)
    private readonly streakRepository: grammarStreakRepositoryInterface.IGrammarStreakRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: BreakGrammarTrapCommand): Promise<any> {
    const { userId, trapId } = command;
    const trap = await this.trapRepository.findById(trapId);

    if (!trap) {
      throw new NotFoundException(
        `Không tìm thấy bẫy ngữ pháp với ID: ${trapId}`
      );
    }

    const updated = await this.trapRepository.updateTrap(trapId, {
      status: 'BROKEN',
    });

    // Award XP
    await this.streakRepository.incrementXP(userId, 20);

    // Publish event
    await this.eventBus.publish(new TrapBrokenEvent(trapId, userId));

    return {
      success: true,
      xpEarned: 20,
      data: updated,
    };
  }
}
