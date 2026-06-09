import { UserSrsProgressEntity } from '../entities/user-srs-progress.entity';

export interface IGrammarSrsRepository {
  findDueProgress(userId: string, now: Date): Promise<UserSrsProgressEntity[]>;
  findProgress(userId: string, quizId: string): Promise<UserSrsProgressEntity | null>;
  upsertProgress(
    userId: string,
    quizId: string,
    data: { interval: number; easeFactor: number; repetitions: number; dueDate: Date }
  ): Promise<UserSrsProgressEntity>;
}

export const GRAMMAR_SRS_REPOSITORY = 'IGrammarSrsRepository';
