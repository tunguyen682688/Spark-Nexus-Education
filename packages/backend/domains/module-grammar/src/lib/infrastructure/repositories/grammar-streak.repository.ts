import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { IGrammarStreakRepository } from '../../domain/repositories/grammar-streak.repository.interface';
import { UserDailyStreakEntity } from '../../domain/entities/user-daily-streak.entity';

@Injectable()
export class GrammarStreakRepository implements IGrammarStreakRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<UserDailyStreakEntity | null> {
    const record = await this.prisma.userDailyStreak.findUnique({
      where: { userId },
    });
    return record ? this.toDomain(record) : null;
  }

  async upsertStreak(
    userId: string,
    data: { streakCount?: number; totalXP?: number; lastActiveAt?: Date }
  ): Promise<UserDailyStreakEntity> {
    const updateData: any = {};
    if (data.streakCount !== undefined) updateData.streakCount = data.streakCount;
    if (data.totalXP !== undefined) updateData.totalXP = data.totalXP;
    if (data.lastActiveAt !== undefined) updateData.lastActiveAt = data.lastActiveAt;

    const record = await this.prisma.userDailyStreak.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        streakCount: data.streakCount || 0,
        totalXP: data.totalXP || 0,
        lastActiveAt: data.lastActiveAt || new Date(),
      },
    });
    return this.toDomain(record);
  }

  async incrementXP(userId: string, xp: number): Promise<UserDailyStreakEntity> {
    const record = await this.prisma.userDailyStreak.upsert({
      where: { userId },
      update: {
        totalXP: { increment: xp },
      },
      create: {
        userId,
        streakCount: 0,
        totalXP: xp,
      },
    });
    return this.toDomain(record);
  }

  async getLeaderboard(take = 50): Promise<UserDailyStreakEntity[]> {
    const records = await this.prisma.userDailyStreak.findMany({
      orderBy: { totalXP: 'desc' },
      take,
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(r: any): UserDailyStreakEntity {
    return new UserDailyStreakEntity({
      id: r.id,
      userId: r.userId,
      streakCount: r.streakCount,
      lastActiveAt: r.lastActiveAt,
      totalXP: r.totalXP,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }
}
