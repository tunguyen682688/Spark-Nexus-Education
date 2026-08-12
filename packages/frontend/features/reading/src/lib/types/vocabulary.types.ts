export interface VocabularySet {
  id: string;
  title: string;
  description: string | null;
  entryCount: number;
  favoriteCount: number;
  studyCount: number;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WordFull {
  id: string;
  word: string;
  language: string;
  pronunciation: string | null;
  partOfSpeech: string | null;
  frequency: number;
  isDraft: boolean;
  isPublished: boolean;
  notes: string | null;
  sourceUrl: string | null;
  tags: string[];
  audioUrl: string | null;
  senses: Array<{
    id: string;
    definition: string;
    partOfSpeech: string | null;
    level: string | null;
    topic: string | null;
    synonym: string | null;
    antonym: string | null;
    usage: string | null;
    etymologyText: string | null;
    fieldOfStudy: string | null;
    note: string | null;
    seeAlso: string | null;
    images: string[];
  }>;
  examples: Array<{
    id: string;
    exampleText: string;
    translation: string | null;
  }>;
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
  partOfSpeech?: string | null;
  position?: number | null;
  addedAt: string;
  wordMinimum?: WordMinimum;
  wordDetails?: WordFull;
}

export interface AddWordToPackagePayload {
  wordId?: string;
  word?: {
    word: string;
    definition: string;
    example?: string | null;
    partOfSpeech?: string | null;
    notes?: string;
  };
}

export interface WeakWordItem {
  id: string;
  word: string;
  pronunciation?: string | null;
  partOfSpeech?: string | null;
  audioUrl?: string | null;
  definition: string;
  example?: string | null;
  masteryLevel?: number;
  status?: string;
}

export interface SyntaxNode {
  label: string;
  text?: string;
  children?: SyntaxNode[];
}
