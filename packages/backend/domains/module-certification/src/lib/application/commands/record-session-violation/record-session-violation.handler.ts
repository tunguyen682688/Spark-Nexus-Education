import { ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { SessionViolationEntity } from '../../../domain/entities/session-violation.entity';
import { SessionViolationRecordedEvent } from '../../../domain/events/session-violation-recorded.event';
import { RecordSessionViolationCommand } from './record-session-violation.command';

@CommandHandler(RecordSessionViolationCommand)
export class RecordSessionViolationHandler implements ICommandHandler<RecordSessionViolationCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly certificationRepo: certificationRepoInterface.ICertificationRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: RecordSessionViolationCommand): Promise<SessionViolationEntity> {
    const session = await this.certificationRepo.findSessionById(command.sessionId);
    if (!session) {
      throw new NotFoundException(`Exam session with ID ${command.sessionId} not found`);
    }

    if (session.getUserId() !== command.userId) {
      throw new ForbiddenException('You do not have permission to record violations for this session');
    }

    const violation = SessionViolationEntity.create({
      id: crypto.randomUUID(),
      sessionId: command.sessionId,
      violationType: command.violationType,
      description: command.description,
      occurredAt: new Date(),
    });

    const saved = await this.certificationRepo.saveViolation(violation);

    this.eventBus.publish(
      new SessionViolationRecordedEvent(
        saved.id,
        saved.getSessionId(),
        saved.getViolationType(),
        saved.getDescription(),
        saved.getOccurredAt()
      )
    );

    return saved;
  }
}
