import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { UserGrammarProgressEntity } from '../../domain/entities/user-grammar-progress.entity';
import { IGrammarProgressRepository } from '../../domain/repositories/grammar-progress.repository.interface';

@Injectable()
export class GrammarProgressRepository implements IGrammarProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndLesson(userId: string, lessonId: string): Promise<UserGrammarProgressEntity | null> {
    const record = await this.prisma.userGrammarProgress.findUnique({
      where: {
        idx_user_grammar_lesson: {
          userId,
          lessonId,
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByUser(userId: string): Promise<UserGrammarProgressEntity[]> {
    const records = await this.prisma.userGrammarProgress.findMany({
      where: { userId },
    });
    return records.map((r) => this.toDomain(r));
  }

  async upsert(
    userId: string,
    lessonId: string,
    data: { status?: string; proficiency?: number; quickNotes?: string }
  ): Promise<UserGrammarProgressEntity> {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.proficiency !== undefined) updateData.proficiency = data.proficiency;
    if (data.quickNotes !== undefined) updateData.quickNotes = data.quickNotes;

    const record = await this.prisma.userGrammarProgress.upsert({
      where: {
        idx_user_grammar_lesson: {
          userId,
          lessonId,
        },
      },
      update: updateData,
      create: {
        userId,
        lessonId,
        status: data.status || 'IN_PROGRESS',
        proficiency: data.proficiency || 0,
        quickNotes: data.quickNotes || '',
      },
    });

    return this.toDomain(record);
  }

  async countMasteredByUser(userId: string): Promise<number> {
    return this.prisma.userGrammarProgress.count({
      where: {
        userId,
        status: 'MASTERED',
      },
    });
  }

  private toDomain(record: any): UserGrammarProgressEntity {
    return new UserGrammarProgressEntity({
      id: record.id,
      userId: record.userId,
      lessonId: record.lessonId,
      status: record.status as 'IN_PROGRESS' | 'MASTERED',
      proficiency: record.proficiency,
      quickNotes: record.quickNotes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
