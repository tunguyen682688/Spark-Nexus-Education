import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { IGrammarSrsRepository } from '../../domain/repositories/grammar-srs.repository.interface';
import { UserSrsProgressEntity } from '../../domain/entities/user-srs-progress.entity';

@Injectable()
export class GrammarSrsRepository implements IGrammarSrsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDueProgress(userId: string, now: Date): Promise<UserSrsProgressEntity[]> {
    const records = await this.prisma.userSrsProgress.findMany({
      where: {
        userId,
        dueDate: { lte: now },
      },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findProgress(userId: string, quizId: string): Promise<UserSrsProgressEntity | null> {
    const record = await this.prisma.userSrsProgress.findUnique({
      where: {
        idx_user_srs_quiz: {
          userId,
          quizId,
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async upsertProgress(
    userId: string,
    quizId: string,
    data: { interval: number; easeFactor: number; repetitions: number; dueDate: Date }
  ): Promise<UserSrsProgressEntity> {
    const record = await this.prisma.userSrsProgress.upsert({
      where: {
        idx_user_srs_quiz: {
          userId,
          quizId,
        },
      },
      update: {
        interval: data.interval,
        easeFactor: data.easeFactor,
        repetitions: data.repetitions,
        dueDate: data.dueDate,
      },
      create: {
        userId,
        quizId,
        interval: data.interval,
        easeFactor: data.easeFactor,
        repetitions: data.repetitions,
        dueDate: data.dueDate,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(r: any): UserSrsProgressEntity {
    return new UserSrsProgressEntity({
      id: r.id,
      userId: r.userId,
      quizId: r.quizId,
      interval: r.interval,
      easeFactor: r.easeFactor,
      repetitions: r.repetitions,
      dueDate: r.dueDate,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }
}
