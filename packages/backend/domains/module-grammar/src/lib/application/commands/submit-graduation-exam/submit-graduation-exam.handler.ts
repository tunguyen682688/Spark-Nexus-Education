import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { SubmitGraduationExamCommand } from './submit-graduation-exam.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_GRADUATION_REPOSITORY } from '../../../domain/repositories/grammar-graduation.repository.interface';
import type { IGrammarGraduationRepository } from '../../../domain/repositories/grammar-graduation.repository.interface';
import { GraduationPassedEvent } from '../../../domain/events/graduation-passed.event';

@CommandHandler(SubmitGraduationExamCommand)
export class SubmitGraduationExamHandler implements ICommandHandler<SubmitGraduationExamCommand, any> {
  constructor(
    @Inject(GRAMMAR_GRADUATION_REPOSITORY)
    private readonly graduationRepository: IGrammarGraduationRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SubmitGraduationExamCommand): Promise<any> {
    const { userId, level, percentage } = command;
    const isPassed = percentage >= 80;

    const graduation = await this.graduationRepository.upsertGraduation(userId, level, {
      isPassed,
      bestScore: percentage,
      certificateUrl: isPassed ? `/certificates/${level.toLowerCase()}-cert.pdf` : null,
    });

    if (isPassed) {
      // Publish event (event handlers will award XP and unlock next level)
      await this.eventBus.publish(new GraduationPassedEvent(userId, level, 500));
    }

    return {
      success: true,
      isPassed,
      data: graduation,
    };
  }
}
