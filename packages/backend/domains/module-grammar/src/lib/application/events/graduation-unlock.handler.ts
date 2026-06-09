import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GRAMMAR_LESSON_REPOSITORY } from '../../domain/repositories/grammar-lesson.repository.interface';
import type { IGrammarLessonRepository } from '../../domain/repositories/grammar-lesson.repository.interface';
import { GRAMMAR_PROGRESS_REPOSITORY } from '../../domain/repositories/grammar-progress.repository.interface';
import type { IGrammarProgressRepository } from '../../domain/repositories/grammar-progress.repository.interface';
import { GraduationPassedEvent } from '../../domain/events/graduation-passed.event';

@EventsHandler(GraduationPassedEvent)
export class GraduationUnlockHandler implements IEventHandler<GraduationPassedEvent> {
  private readonly logger = new Logger(GraduationUnlockHandler.name);

  constructor(
    @Inject(GRAMMAR_LESSON_REPOSITORY)
    private readonly lessonRepository: IGrammarLessonRepository,
    @Inject(GRAMMAR_PROGRESS_REPOSITORY)
    private readonly progressRepository: IGrammarProgressRepository
  ) {}

  async handle(event: GraduationPassedEvent): Promise<void> {
    const { userId, level } = event;
    const levelsOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIdx = levelsOrder.indexOf(level.toUpperCase());
    
    if (currentIdx !== -1 && currentIdx < levelsOrder.length - 1) {
      const nextLevel = levelsOrder[currentIdx + 1];
      this.logger.log(`User ${userId} passed level ${level}. Unlocking first lesson of next level ${nextLevel}`);

      const lessons = await this.lessonRepository.findAll({ deleted: false });
      const firstLessonOfNextLevel = lessons.find(
        (l: any) => l.level?.value === nextLevel && l.status?.value === 'PUBLISHED'
      );

      if (firstLessonOfNextLevel) {
        await this.progressRepository.upsert(userId, firstLessonOfNextLevel.id, {
          status: 'IN_PROGRESS',
        });
        this.logger.log(`Unlocked lesson ${firstLessonOfNextLevel.id} for user ${userId}`);
      }
    }
  }
}
