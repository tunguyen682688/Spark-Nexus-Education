import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { SubmitDailyQuizCommand } from './submit-daily-quiz.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_STREAK_REPOSITORY } from '../../../domain/repositories/grammar-streak.repository.interface';
import type { IGrammarStreakRepository } from '../../../domain/repositories/grammar-streak.repository.interface';
import { DailyQuizSubmittedEvent } from '../../../domain/events/daily-quiz-submitted.event';

@CommandHandler(SubmitDailyQuizCommand)
export class SubmitDailyQuizHandler implements ICommandHandler<SubmitDailyQuizCommand, any> {
  constructor(
    @Inject(GRAMMAR_STREAK_REPOSITORY)
    private readonly streakRepository: IGrammarStreakRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SubmitDailyQuizCommand): Promise<any> {
    const { userId, dto } = command;
    const xpEarned = dto.xpEarned || 0;
    const score = dto.score || 100;

    let streakRecord = await this.streakRepository.findByUser(userId);
    const now = new Date();

    if (!streakRecord) {
      streakRecord = await this.streakRepository.upsertStreak(userId, {
        streakCount: 1,
        totalXP: xpEarned,
        lastActiveAt: now,
      });
    } else {
      const lastActive = streakRecord.lastActiveAt;
      let newStreak = streakRecord.streakCount;
      if (lastActive) {
        const diffTime = Math.abs(now.getTime() - lastActive.getTime());
        const diffHours = diffTime / (1000 * 60 * 60);

        if (diffHours >= 12 && diffHours <= 36) {
          newStreak += 1;
        } else if (diffHours > 36) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      streakRecord = await this.streakRepository.upsertStreak(userId, {
        streakCount: newStreak,
        totalXP: streakRecord.totalXP + xpEarned,
        lastActiveAt: now,
      });
    }

    // Publish event
    await this.eventBus.publish(new DailyQuizSubmittedEvent(userId, score, xpEarned));

    return {
      success: true,
      data: streakRecord,
    };
  }
}
