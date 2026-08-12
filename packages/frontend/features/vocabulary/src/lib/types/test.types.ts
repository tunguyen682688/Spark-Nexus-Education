import type { QuizWord } from './quiz.types';

export type TestQuestionType = 'mcq' | 'fill-blank' | 'matching';

export interface TestMatchPair {
  left: string;
  right: string;
}

export interface TestQuestion {
  id: string;
  type: TestQuestionType;
  card: QuizWord;
  question: string;
  options?: string[];
  correctAnswer: string;
  correctIndex?: number;
  matchPairs?: TestMatchPair[];
}

export interface TestSessionAnswer {
  questionId: string;
  type: TestQuestionType;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface TestSessionConfig {
  questionCount: number;
  types: TestQuestionType[];
  timeLimitSeconds: number | null;
}

export interface TestCompletionStats {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  accuracy: number;
  totalTimeSeconds: number;
  byType: Record<TestQuestionType, { correct: number; total: number }>;
}
