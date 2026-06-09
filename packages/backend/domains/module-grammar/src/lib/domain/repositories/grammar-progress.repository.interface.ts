import { UserGrammarProgressEntity } from '../entities/user-grammar-progress.entity';

export interface IGrammarProgressRepository {
  findByUserAndLesson(userId: string, lessonId: string): Promise<UserGrammarProgressEntity | null>;
  findByUser(userId: string): Promise<UserGrammarProgressEntity[]>;
  upsert(
    userId: string,
    lessonId: string,
    data: { status?: string; proficiency?: number; quickNotes?: string }
  ): Promise<UserGrammarProgressEntity>;
  countMasteredByUser(userId: string): Promise<number>;
}

export const GRAMMAR_PROGRESS_REPOSITORY = 'IGrammarProgressRepository';
