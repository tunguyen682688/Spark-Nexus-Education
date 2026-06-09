import { UserLevelGraduationEntity } from '../entities/user-level-graduation.entity';

export interface IGrammarGraduationRepository {
  findGraduation(userId: string, level: string): Promise<UserLevelGraduationEntity | null>;
  upsertGraduation(
    userId: string,
    level: string,
    data: { isPassed: boolean; bestScore: number; certificateUrl?: string | null }
  ): Promise<UserLevelGraduationEntity>;
}

export const GRAMMAR_GRADUATION_REPOSITORY = 'IGrammarGraduationRepository';
