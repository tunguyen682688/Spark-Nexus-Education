import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { SessionAnswerEntity } from '../../../domain/entities/session-answer.entity';
import { ExamSessionEntity } from '../../../domain/entities/exam-session.entity';
import * as crypto from 'crypto';
import { SaveSessionAnswerCommand } from './save-session-answer.command';

@CommandHandler(SaveSessionAnswerCommand)
export class SaveSessionAnswerCommandHandler implements ICommandHandler<SaveSessionAnswerCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly certificationRepo: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: SaveSessionAnswerCommand): Promise<SessionAnswerEntity> {
    const session = await this.certificationRepo.findSessionById(command.sessionId);
    if (!session) {
      throw new NotFoundException(`Exam session with ID ${command.sessionId} not found`);
    }

    if (session.getStatus() !== 'started' && session.getStatus() !== 'in_progress') {
      throw new BadRequestException(`Cannot save answer for session in status: ${session.getStatus()}`);
    }

    // Set status to in_progress if it was started
    if (session.getStatus() === 'started') {
      const updatedSession = ExamSessionEntity.create({
        id: session.id,
        userId: session.getUserId(),
        examId: session.getExamId(),
        status: 'in_progress',
        startedAt: session.getStartedAt(),
        endedAt: session.getEndedAt(),
        createdAt: session.createdAt,
        updatedAt: new Date(),
        version: session.version,
      });
      await this.certificationRepo.saveSession(updatedSession);
    }

    // Check if user answer already exists for this question in the session
    const existingAnswers = await this.certificationRepo.findAnswersBySessionId(command.sessionId);
    const existing = existingAnswers.find((a: SessionAnswerEntity) => a.getQuestionId() === command.questionId);

    let answerEntity: SessionAnswerEntity;

    if (existing) {
      answerEntity = SessionAnswerEntity.create({
        id: existing.id,
        sessionId: existing.getSessionId(),
        questionId: existing.getQuestionId(),
        answerText: command.answerText,
        choiceIds: command.choiceIds,
        isCorrect: existing.getIsCorrect(),
        points: existing.getPoints(),
        createdBy: existing.getCreatedBy(),
        updatedBy: existing.getUpdatedBy(),
        createdAt: existing.createdAt,
        updatedAt: new Date(),
      });
    } else {
      answerEntity = SessionAnswerEntity.create({
        id: crypto.randomUUID(),
        sessionId: command.sessionId,
        questionId: command.questionId,
        answerText: command.answerText,
        choiceIds: command.choiceIds,
      });
    }

    const saved = await this.certificationRepo.saveSessionAnswer(answerEntity);
    return saved;
  }
}

export { SaveSessionAnswerCommandHandler as SaveSessionAnswerHandler };
