import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLeaderboardQuery } from './get-leaderboard.query';
import { Inject } from '@nestjs/common';
import { GRAMMAR_STREAK_REPOSITORY } from '../../../domain/repositories/grammar-streak.repository.interface';
import type { IGrammarStreakRepository } from '../../../domain/repositories/grammar-streak.repository.interface';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';

@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardHandler implements IQueryHandler<GetLeaderboardQuery, any> {
  constructor(
    @Inject(GRAMMAR_STREAK_REPOSITORY)
    private readonly streakRepository: IGrammarStreakRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(query: GetLeaderboardQuery): Promise<any> {
    const topStreaks = await this.streakRepository.getLeaderboard(50);
    const userIds = topStreaks.map((s) => s.userId);

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, picture: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return topStreaks.map((streak, index) => {
      const user = userMap.get(streak.userId);
      return {
        id: streak.userId,
        name: user?.name || `User ${streak.userId.substring(0, 5)}`,
        avatar: user?.picture || '👤',
        xp: streak.totalXP,
        streak: streak.streakCount,
        rank: index + 1,
      };
    });
  }
}
