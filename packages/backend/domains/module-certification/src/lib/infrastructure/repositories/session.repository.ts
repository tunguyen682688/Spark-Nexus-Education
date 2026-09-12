import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { ExamSessionEntity } from '../../domain/entities/exam-session.entity';
import { SessionAnswerEntity } from '../../domain/entities/session-answer.entity';
import { SessionViolationEntity } from '../../domain/entities/session-violation.entity';
import {
  mapSessionToEntity,
  mapAnswerToEntity,
  mapViolationToEntity,
} from './mappers';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSessionById(id: string): Promise<ExamSessionEntity | null> {
    const session = await this.prisma.examSession.findUnique({
      where: { id },
      include: {
        answers: true,
        violations: true,
      },
    });
    if (!session) return null;
    return mapSessionToEntity(session);
  }

  async saveSession(session: ExamSessionEntity): Promise<ExamSessionEntity> {
    const data = {
      examId: session.getExamId(),
      userId: session.getUserId(),
      status: session.getStatus(),
      startedAt: session.getStartedAt(),
      endedAt: session.getEndedAt(),
      version: session.version + BigInt(1),
    };

    const saved = await this.prisma.examSession.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        ...data,
      },
      update: data,
    });

    return mapSessionToEntity(saved);
  }

  async findSessionsByUserId(userId: string): Promise<ExamSessionEntity[]> {
    const sessions = await this.prisma.examSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });
    return sessions.map((s) => mapSessionToEntity(s));
  }

  async findInProgressSessionsByUserId(userId: string) {
    const sessions = await this.prisma.examSession.findMany({
      where: { userId, status: 'in_progress' },
      include: {
        exam: {
          select: { id: true, title: true, collectionId: true, duration: true, totalQuestions: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
    return sessions.map((s) => ({
      id: s.id,
      examId: s.examId,
      userId: s.userId,
      status: s.status,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      exam: s.exam ? { id: s.exam.id, title: s.exam.title, collectionId: s.exam.collectionId, duration: s.exam.duration, totalQuestions: s.exam.totalQuestions } : null,
    }));
  }

  async findAnswersBySessionId(sessionId: string): Promise<SessionAnswerEntity[]> {
    const answers = await this.prisma.sessionAnswer.findMany({
      where: { sessionId },
    });
    return answers.map((a) => mapAnswerToEntity(a));
  }

  async saveSessionAnswer(answer: SessionAnswerEntity): Promise<SessionAnswerEntity> {
    const data = {
      sessionId: answer.getSessionId(),
      questionId: answer.getQuestionId(),
      answerText: answer.getAnswerText(),
      choiceIds: answer.getChoiceIds(),
      isCorrect: answer.getIsCorrect(),
      points: answer.getPoints(),
      createdBy: answer.getCreatedBy(),
      updatedBy: answer.getUpdatedBy(),
      version: answer.version + BigInt(1),
    };

    const saved = await this.prisma.sessionAnswer.upsert({
      where: { id: answer.id },
      create: {
        id: answer.id,
        ...data,
      },
      update: data,
    });

    return mapAnswerToEntity(saved);
  }

  async saveViolation(violation: SessionViolationEntity): Promise<SessionViolationEntity> {
    const data = {
      sessionId: violation.getSessionId(),
      violationType: violation.getViolationType(),
      description: violation.getDescription(),
      occurredAt: violation.getOccurredAt(),
    };

    const saved = await this.prisma.sessionViolation.create({
      data: {
        id: violation.id,
        ...data,
      },
    });

    return mapViolationToEntity(saved);
  }
}
