import { UserGrammarTrapEntity } from '../entities/grammar-trap.entity';

export interface IGrammarTrapRepository {
  findById(id: string): Promise<UserGrammarTrapEntity | null>;
  findByUser(userId: string, status?: string): Promise<UserGrammarTrapEntity[]>;
  upsertTrap(
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
  ): Promise<UserGrammarTrapEntity>;
  updateTrap(id: string, data: { status?: string; aiAnalysis?: string }): Promise<UserGrammarTrapEntity>;
}

export const GRAMMAR_TRAP_REPOSITORY = 'IGrammarTrapRepository';
