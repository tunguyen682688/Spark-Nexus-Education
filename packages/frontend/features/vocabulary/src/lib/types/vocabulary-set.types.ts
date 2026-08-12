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
  senses?: Sense[];
  examples?: WordExample[];
  expressions?: Expression[];
  lexicalVariants?: LexicalVariant[];
}

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
  customWord?: string | null;
  customDefinition?: string | null;
  customExample?: string | null;
  notes?: string | null;
  paartOfSpeech?: string | null;
  position?: number | null;
  addedAt: string;
  wordMinimum?: WordMinimum;
  wordDetails?: Word;
  userProgress?: import('./api.types').UserVocabularyProgressResponse;
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

export interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  reviewWords: number;
  studyStreak: number;
  totalSets: number;
  lastActivity?: string;
}
