import { ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';
import { ExamSessionDomainService } from '../../domain/services/exam-session-domain.service';
import { ExamResultEntity } from '../../domain/entities/exam-result.entity';
import { ExamSessionSubmittedEvent } from '../../domain/events/exam-session-submitted.event';

export class SubmitExamSessionCommand {
  constructor(public readonly sessionId: string) {}
}

@CommandHandler(SubmitExamSessionCommand)
export class SubmitExamSessionHandler implements ICommandHandler<SubmitExamSessionCommand> {
  constructor(
    private readonly sessionDomainService: ExamSessionDomainService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: SubmitExamSessionCommand): Promise<ExamResultEntity> {
    const result = await this.sessionDomainService.completeSession(command.sessionId);

    this.eventBus.publish(
      new ExamSessionSubmittedEvent(
        result.getSessionId(),
        result.getExamId(),
        result.getUserId(),
        result.getTotalScore(),
        result.isPassed(),
        new Date()
      )
    );

    return result;
  }
}
