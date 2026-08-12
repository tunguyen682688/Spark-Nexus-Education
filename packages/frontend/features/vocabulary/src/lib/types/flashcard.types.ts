import type { VocabularySetItem, Word } from './vocabulary-set.types';
import type { UserVocabularyProgressResponse } from './api.types';

export interface FlashcardSession {
  id: string;
  vocabularySetId: string;
  words: Word[];
  currentIndex: number;
  status: 'new' | 'review';
  order: 'sequential' | 'random';
  flipMode: 'word' | 'definition';
}

export interface SRSReviewItem {
  id: string;
  wordId: string;
  word: Word;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface FlashcardSessionWord {
  item: VocabularySetItem;
  progress: UserVocabularyProgressResponse | null;
}

export interface FlashcardSessionResponse {
  id: string;
  setId: string;
  title: string;
  description?: string;
  streak: number;
  words: FlashcardSessionWord[];
}

export interface FlashcardProgressInfo {
  id?: string;
  status: 'NEW' | 'LEARNING' | 'MASTERED';
  streak: number;
  masteryLevel: number;
  repetitions: number;
  interval: number;
  easeFactor?: number;
}

export interface FlashcardWord {
  item: VocabularySetItem;
  progress: FlashcardProgressInfo | null;
}
