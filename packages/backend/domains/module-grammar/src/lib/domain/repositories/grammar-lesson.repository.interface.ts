import { GrammarLessonEntity } from '../entities/grammar-lesson.entity';

export interface IGrammarLessonRepository {
  findById(id: string): Promise<GrammarLessonEntity | null>;
  findAll(options?: { deleted?: boolean }): Promise<GrammarLessonEntity[]>;
  create(lesson: GrammarLessonEntity): Promise<GrammarLessonEntity>;
  update(id: string, lesson: Partial<GrammarLessonEntity> | any): Promise<GrammarLessonEntity>;
  count(options?: { deleted?: boolean; status?: string }): Promise<number>;
}

export const GRAMMAR_LESSON_REPOSITORY = 'IGrammarLessonRepository';
