import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CompleteLessonCommand } from './complete-lesson.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_PROGRESS_REPOSITORY } from '../../../domain/repositories/grammar-progress.repository.interface';
import type { IGrammarProgressRepository } from '../../../domain/repositories/grammar-progress.repository.interface';
import { LessonCompletedEvent } from '../../../domain/events/lesson-completed.event';

@CommandHandler(CompleteLessonCommand)
export class CompleteLessonHandler implements ICommandHandler<CompleteLessonCommand, any> {
  constructor(
    @Inject(GRAMMAR_PROGRESS_REPOSITORY)
    private readonly progressRepository: IGrammarProgressRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CompleteLessonCommand): Promise<any> {
    const { lessonId, userId, score } = command;

    const existingProgress = await this.progressRepository.findByUserAndLesson(userId, lessonId);
    const wasMastered = existingProgress ? (existingProgress as any).status === 'MASTERED' : false;

    const progress = await this.progressRepository.upsert(userId, lessonId, {
      status: 'MASTERED',
      proficiency: 100,
    });

    if (!wasMastered) {
      // Fire Domain Event
      await this.eventBus.publish(new LessonCompletedEvent(lessonId, userId, score));
    }

    return {
      success: true,
      data: progress,
    };
  }
}
