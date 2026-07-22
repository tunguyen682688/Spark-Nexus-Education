import { ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';
import { ExamSessionEntity } from '../../domain/entities/exam-session.entity';
import { ExamSessionStartedEvent } from '../../domain/events/exam-session-started.event';

export class StartExamSessionCommand {
  constructor(
    public readonly examId: string,
    public readonly userId: string
  ) {}
}

@CommandHandler(StartExamSessionCommand)
export class StartExamSessionHandler implements ICommandHandler<StartExamSessionCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly certificationRepo: certificationRepoInterface.ICertificationRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: StartExamSessionCommand): Promise<ExamSessionEntity> {
    const exam = await this.certificationRepo.findExamById(command.examId);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${command.examId} not found`);
    }

    const session = ExamSessionEntity.create({
      id: crypto.randomUUID(),
      examId: command.examId,
      userId: command.userId,
      status: 'started',
    });

    const saved = await this.certificationRepo.saveSession(session);

    this.eventBus.publish(
      new ExamSessionStartedEvent(
        saved.id,
        saved.getExamId(),
        saved.getUserId(),
        saved.getStartedAt()
      )
    );

    return saved;
  }
}
