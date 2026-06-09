import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitSrsFeedbackCommand } from './submit-srs-feedback.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_SRS_REPOSITORY } from '../../../domain/repositories/grammar-srs.repository.interface';
import type { IGrammarSrsRepository } from '../../../domain/repositories/grammar-srs.repository.interface';
import { GRAMMAR_STREAK_REPOSITORY } from '../../../domain/repositories/grammar-streak.repository.interface';
import type { IGrammarStreakRepository } from '../../../domain/repositories/grammar-streak.repository.interface';

@CommandHandler(SubmitSrsFeedbackCommand)
export class SubmitSrsFeedbackHandler implements ICommandHandler<SubmitSrsFeedbackCommand, any> {
  constructor(
    @Inject(GRAMMAR_SRS_REPOSITORY)
    private readonly srsRepository: IGrammarSrsRepository,
    @Inject(GRAMMAR_STREAK_REPOSITORY)
    private readonly streakRepository: IGrammarStreakRepository
  ) {}

  async execute(command: SubmitSrsFeedbackCommand): Promise<any> {
    const { userId, quizId, isCorrect } = command;
    const now = new Date();

    const progress = await this.srsRepository.findProgress(userId, quizId);

    let interval = 1;
    let easeFactor = 2.5;
    let repetitions = 0;

    if (progress) {
      interval = progress.interval;
      easeFactor = progress.easeFactor;
      repetitions = progress.repetitions;
    }

    if (isCorrect) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
      easeFactor = easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)); 
    } else {
      repetitions = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    const dueDate = new Date();
    dueDate.setDate(now.getDate() + interval);

    const updated = await this.srsRepository.upsertProgress(userId, quizId, {
      interval,
      easeFactor,
      repetitions,
      dueDate,
    });

    const xpEarned = isCorrect ? 10 : 2;
    await this.streakRepository.incrementXP(userId, xpEarned);

    return {
      success: true,
      nextReviewDate: dueDate,
      intervalDays: interval,
      data: updated,
    };
  }
}
