import type { VocabularySetItem } from './vocabulary-set.types';
import type { UserVocabularyProgressResponse } from './api.types';

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'fill-blank' | 'definition-match';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export interface QuizSession {
  id: string;
  vocabularySetId: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score?: number;
  completedAt?: string;
  createdAt: string;
}

export interface QuizProgressInfo {
  id?: string;
  status: 'NEW' | 'LEARNING' | 'MASTERED';
  streak: number;
  masteryLevel: number;
  repetitions: number;
  interval: number;
  easeFactor?: number;
}

export interface QuizWord {
  item: VocabularySetItem;
  progress: QuizProgressInfo | null;
}

export interface LearningQuizQuestion {
  questionIndex: number;
  card: QuizWord;
  question: string;
  options: string[];
  correctIndex: number;
}
