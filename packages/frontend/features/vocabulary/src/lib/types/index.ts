// Note: Import ApiQueryParams and SimplifiedPaginatedResponse directly from '@spark-nest-ed/frontend-core-api'
// to avoid static imports of lazy-loaded libraries.
// Example: import type { ApiQueryParams } from '@spark-nest-ed/frontend-core-api';

// Vocabulary specific types
// NOTE: These values must stay in sync with the backend API validation.
// Backend expects:
// - language: 'en', 'vi', 'ja', 'ko', 'zh', 'es', 'fr', 'de'
// - type: 'custom', 'flashcard', 'quiz', 'reading', 'listening', 'mixed'
// - difficulty: 'beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'proficient'
export enum VocabularySetType {
  FLASHCARD = 'flashcard',
  QUIZ = 'quiz',
  MIXED = 'mixed',
  CUSTOM = 'custom',
  READING = 'reading',
  LISTENING = 'listening',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
  PROFICIENT = 'proficient',
}
export enum WordStatus {
  NEW = 'NEW',
  LEARNING = 'LEARNING',
  REVIEWING = 'REVIEWING',
  MASTERED = 'MASTERED',
}
export enum Language {
  ENGLISH = 'en',
  VIETNAMESE = 'vi',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  CHINESE = 'zh',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
}

export const PARTS_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "preposition",
  "conjunction",
  "pronoun",
  "interjection",
] as const;

export type ImportStatus =
  | 'idle'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ImportProgress {
  total: number;
  processed: number;
  failed: number;
  failedItems?: Array<{ word: string; reason: string }>;
  lastError?: string;
}
export interface VocabularySet {
  id: string;
  title: string;
  description: string | null;
  language: Language;
  type: VocabularySetType;
  difficulty: DifficultyLevel | null;
  tags: string[];
  coverImage: string | null;
  userId: string;
  creator?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  entryCount: number;
  favoriteCount: number;
  studyCount: number;
  isPublic: boolean;
  isActive: boolean;
  importStatus: ImportStatus;
  importProgress: ImportProgress | null;
  createdAt: string;
  updatedAt: string;
}

export interface Sense {
  id: string;
  definition: string;
  partOfSpeech?: string | null;
  level?: string | null;
  topic?: string | null;
  synonym?: string | null;
  antonym?: string | null;
  usage?: string | null;
  etymologyText?: string | null;
  fieldOfStudy?: string | null;
  note?: string | null;
  seeAlso?: string | null;
  images?: string[];
}

export interface WordExample {
  id: string;
  exampleText: string;
  translation?: string | null;
}

export interface ExpressionMeaning {
  id: string;
  meaningText: string;
  meaningOrder: number;
  usageNotes?: string | null;
}

export interface Expression {
  id: string;
  expression: string;
  meanings?: ExpressionMeaning[];
}

export interface LexicalVariant {
  id: string;
  partOfSpeech?: string | null;
  pronunciation?: string | null;
  notes?: string | null;
}

export interface Word {
  id: string;
  word: string;
  language?: Language;
  definition: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  audioUrl?: string | null;
  sourceUrl?: string | null;
  tags?: string[];
  example?: string;
  notes?: string | null;
  synonyms?: string[];
  antonyms?: string[];
  frequency?: number;
  status?: WordStatus;
  isDraft?: boolean;
  isPublished?: boolean;
  masteryLevel?: number;
  lastReviewed?: string;
  nextReview?: string;
  createdAt: string;
  updatedAt: string;
  // Full details from API
  senses?: Sense[];
  examples?: WordExample[];
  expressions?: Expression[];
  lexicalVariants?: LexicalVariant[];
}

// Minimum word payload returned in VocabularySetItem.wordMinimum
export interface WordMinimum {
  id: string;
  word: string;
  definition?: string | null;
  example?: string | null;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
}

export interface VocabularySetItem {
  id: string;
  vocabularySetId: string;
  entryId: string;
  // Per-set / per-user custom fields
  customWord?: string | null;
  customDefinition?: string | null;
  customExample?: string | null;
  notes?: string | null;
  paartOfSpeech?: string | null;
  position?: number | null;
  addedAt: string;
  // Dictionary data
  wordMinimum?: WordMinimum;
  // Optional full details when requested
  wordDetails?: Word;
  // User learning progress for this specific item
  userProgress?: UserVocabularyProgressResponse;
}

export interface CreateVocabularySetDto {
  title: string;
  description?: string;
  language: Language;
  type: VocabularySetType;
  difficulty?: DifficultyLevel;
  tags?: string[];
  initialEntryIds?: string[];
  initialWords?: Array<{
    word: string;
    definition: string;
    example?: string;
    notes?: string;
    partOfSpeech?: string;
  }>;
}

export interface UpdateVocabularySetDto {
  title?: string;
  description?: string;
  difficulty?: DifficultyLevel;
  tags?: string[];
  visibility?: 'PUBLIC' | 'PRIVATE';
}

export interface AddWordToSetDto {
  wordId?: string;
  word?: {
    word: string;
    definition: string;
    example?: string;
    notes?: string;
    partOfSpeech?: string;
  };
}

export interface SyncItemDto extends AddWordToSetDto {
  id?: string;
}

export interface SyncVocabularySetItemsDto {
  items: SyncItemDto[];
  deleteIds?: string[];
}

export interface FlashcardSession {
  id: string;
  vocabularySetId: string;
  words: Word[];
  currentIndex: number;
  status: 'new' | 'review';
  order: 'sequential' | 'random';
  flipMode: 'word' | 'definition';
}

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

export interface SRSReviewItem {
  id: string;
  wordId: string;
  word: Word;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface CommunityVocabularySet extends VocabularySet {
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  favoriteCount: number;
  cloneCount: number;
  isFavorited?: boolean;
}

export interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  reviewWords: number;
  studyStreak: number;
  totalSets: number;
  lastActivity?: string;
}

export interface UserVocabularyProgressResponse {
  id: string;
  userId: string;
  itemId: string;
  status: 'NEW' | 'LEARNING' | 'MASTERED';
  streak: number;
  masteryLevel: number;
  lastReview: string | null;
  nextReviewAt: string | null;
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

// ============================================================================
// Advanced Test Practice Types
// ============================================================================

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
  /** MCQ options (4 choices) */
  options?: string[];
  /** Correct answer string — used for fill-blank and matching */
  correctAnswer: string;
  /** Index of correct option — MCQ only */
  correctIndex?: number;
  /** Matching pairs — matching type only */
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
