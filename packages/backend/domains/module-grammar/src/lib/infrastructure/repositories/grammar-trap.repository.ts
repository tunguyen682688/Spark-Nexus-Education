import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { IGrammarTrapRepository } from '../../domain/repositories/grammar-trap.repository.interface';
import { UserGrammarTrapEntity } from '../../domain/entities/grammar-trap.entity';

@Injectable()
export class GrammarTrapRepository implements IGrammarTrapRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserGrammarTrapEntity | null> {
    const record = await this.prisma.userGrammarTrap.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUser(userId: string, status?: string): Promise<UserGrammarTrapEntity[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    const records = await this.prisma.userGrammarTrap.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async upsertTrap(
    userId: string,
    questionId: string,
    data: {
      questionText: string;
      questionType: string;
      questionData: any;
      category: string;
      userAnswer: string;
      correctAnswer: string;
      explanation: string;
      status: string;
    }
  ): Promise<UserGrammarTrapEntity> {
    const record = await this.prisma.userGrammarTrap.upsert({
      where: {
        idx_user_question_trap: {
          userId,
          questionId,
        },
      },
      update: {
        questionText: data.questionText,
        questionType: data.questionType,
        questionData: data.questionData,
        category: data.category,
        userAnswer: data.userAnswer,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        status: data.status,
      },
      create: {
        userId,
        questionId,
        questionText: data.questionText,
        questionType: data.questionType,
        questionData: data.questionData,
        category: data.category,
        userAnswer: data.userAnswer,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        status: data.status,
      },
    });
    return this.toDomain(record);
  }

  async updateTrap(id: string, data: { status?: string; aiAnalysis?: string }): Promise<UserGrammarTrapEntity> {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.aiAnalysis !== undefined) updateData.aiAnalysis = data.aiAnalysis;

    const record = await this.prisma.userGrammarTrap.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(record);
  }

  private toDomain(r: any): UserGrammarTrapEntity {
    return new UserGrammarTrapEntity({
      id: r.id,
      userId: r.userId,
      questionId: r.questionId,
      questionText: r.questionText,
      questionType: r.questionType,
      questionData: r.questionData,
      category: r.category,
      userAnswer: r.userAnswer,
      correctAnswer: r.correctAnswer,
      explanation: r.explanation,
      aiAnalysis: r.aiAnalysis,
      status: r.status as 'TRAPPED' | 'BROKEN',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }
}
