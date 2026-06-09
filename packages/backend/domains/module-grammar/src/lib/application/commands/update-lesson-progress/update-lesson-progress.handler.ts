import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UpdateLessonProgressCommand } from './update-lesson-progress.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_PROGRESS_REPOSITORY } from '../../../domain/repositories/grammar-progress.repository.interface';
import type { IGrammarProgressRepository } from '../../../domain/repositories/grammar-progress.repository.interface';
import { LessonCompletedEvent } from '../../../domain/events/lesson-completed.event';

@CommandHandler(UpdateLessonProgressCommand)
export class UpdateLessonProgressHandler implements ICommandHandler<UpdateLessonProgressCommand, any> {
  constructor(
    @Inject(GRAMMAR_PROGRESS_REPOSITORY)
    private readonly progressRepository: IGrammarProgressRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdateLessonProgressCommand): Promise<any> {
    const { lessonId, userId, dto } = command;

    const existingProgress = await this.progressRepository.findByUserAndLesson(userId, lessonId);
    const wasMastered = existingProgress ? (existingProgress as any).status === 'MASTERED' : false;

    const targetStatus = dto.status || 'IN_PROGRESS';
    const isNewlyMastered = targetStatus === 'MASTERED' && !wasMastered;

    const progress = await this.progressRepository.upsert(userId, lessonId, {
      status: targetStatus,
      proficiency: targetStatus === 'MASTERED' ? 100 : dto.proficiency,
      quickNotes: dto.quickNotes,
    });

    if (isNewlyMastered) {
      await this.eventBus.publish(new LessonCompletedEvent(lessonId, userId, 100));
    }

    return {
      success: true,
      data: progress,
    };
  }
}
