import { UserDailyStreakEntity } from '../entities/user-daily-streak.entity';

export interface IGrammarStreakRepository {
  findByUser(userId: string): Promise<UserDailyStreakEntity | null>;
  upsertStreak(
    userId: string,
    data: { streakCount?: number; totalXP?: number; lastActiveAt?: Date }
  ): Promise<UserDailyStreakEntity>;
  incrementXP(userId: string, xp: number): Promise<UserDailyStreakEntity>;
  getLeaderboard(take?: number): Promise<UserDailyStreakEntity[]>;
}

export const GRAMMAR_STREAK_REPOSITORY = 'IGrammarStreakRepository';
