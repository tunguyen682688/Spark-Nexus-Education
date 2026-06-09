import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GRAMMAR_STREAK_REPOSITORY } from '../../domain/repositories/grammar-streak.repository.interface';
import type { IGrammarStreakRepository } from '../../domain/repositories/grammar-streak.repository.interface';
import { LessonCompletedEvent } from '../../domain/events/lesson-completed.event';
import { TrapBrokenEvent } from '../../domain/events/trap-broken.event';
import { DailyQuizSubmittedEvent } from '../../domain/events/daily-quiz-submitted.event';
import { ExamAttemptSubmittedEvent } from '../../domain/events/exam-attempt-submitted.event';
import { GraduationPassedEvent } from '../../domain/events/graduation-passed.event';
import { XP_REWARDS } from '../../common/constants/grammar.constants';

@EventsHandler(
  LessonCompletedEvent,
  TrapBrokenEvent,
  DailyQuizSubmittedEvent,
  ExamAttemptSubmittedEvent,
  GraduationPassedEvent
)
export class XpRewardHandler implements IEventHandler<any> {
  private readonly logger = new Logger(XpRewardHandler.name);

  constructor(
    @Inject(GRAMMAR_STREAK_REPOSITORY)
    private readonly streakRepository: IGrammarStreakRepository
  ) {}

  async handle(event: any): Promise<void> {
    let xpEarned = 0;
    let userId = '';
    let reason = '';

    if (event instanceof LessonCompletedEvent) {
      xpEarned = XP_REWARDS.LESSON_COMPLETED || 50;
      userId = event.userId;
      reason = `completing lesson ${event.lessonId}`;
    } else if (event instanceof TrapBrokenEvent) {
      xpEarned = 20;
      userId = event.userId;
      reason = `breaking trap ${event.trapId}`;
    } else if (event instanceof DailyQuizSubmittedEvent) {
      xpEarned = event.xpEarned;
      userId = event.userId;
      reason = 'submitting daily quiz';
    } else if (event instanceof ExamAttemptSubmittedEvent) {
      xpEarned = event.xpEarned;
      userId = event.userId;
      reason = `submitting exam attempt for set ${event.examSetId}`;
    } else if (event instanceof GraduationPassedEvent) {
      xpEarned = event.xpEarned;
      userId = event.userId;
      reason = `passing graduation for level ${event.level}`;
    }

    if (xpEarned > 0 && userId) {
      this.logger.log(`Awarding ${xpEarned} XP to user ${userId} for ${reason}`);
      await this.streakRepository.incrementXP(userId, xpEarned);
    }
  }
}
