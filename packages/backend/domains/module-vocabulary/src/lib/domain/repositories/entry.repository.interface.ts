export interface IEntryRepository {
  findById(id: string): Promise<{
    id: string;
    word: string;
    language: string;
    definition: string | null;
    example: string | null;
  } | null>;

  findByWord(
    word: string,
    language: string
  ): Promise<{
    id: string;
    word: string;
    language: string;
    definition: string | null;
    example: string | null;
  } | null>;

  /**
   * Batch find entries by IDs (for performance optimization)
   */
  findByIds(ids: string[]): Promise<
    Array<{
      id: string;
      word: string;
      language: string;
      definition: string | null;
      example: string | null;
    }>
  >;

  /**
   * Find entries by word list (case-insensitive) within a single language.
   */
  findByWords(
    words: string[],
    language: string
  ): Promise<
    Array<{
      id: string;
      word: string;
      language: string;
      definition: string | null;
      example: string | null;
      partOfSpeech: string | null;
    }>
  >;

  /**
   * Create a minimal entry (word + language) used when learner adds a new word manually.
   * Optionally persists a default definition/example for better future lookups.
   */
  createBasicEntry(input: {
    word: string;
    language: string;
    definition?: string;
    example?: string;
    partOfSpeech?: string;
  }): Promise<{
    id: string;
    word: string;
    language: string;
    definition: string | null;
    example: string | null;
  }>;

  /**
   * Find entry with full details including all relationships
   * Used for detailed word views
   */
  findByIdWithDetails(id: string): Promise<{
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
    expressions: Array<{
      id: string;
      expression: string;
      meanings: Array<{
        id: string;
        meaningText: string;
        meaningOrder: number;
        usageNotes: string | null;
      }>;
    }>;
    variants: Array<{
      id: string;
      partOfSpeech: string | null;
      pronunciation: string | null;
      notes: string | null;
    }>;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  /**
   * Batch find entries with minimum details (for list views)
   */
  findByIdsMinimum(ids: string[]): Promise<
    Array<{
      id: string;
      word: string;
      definition: string | null;
      example: string | null;
      pronunciation: string | null;
      partOfSpeech: string | null;
    }>
  >;

  /**
   * Update entry with full data (word, definition, example, partOfSpeech)
   * Used when updating a vocabulary set item
   */
  updateEntry(
    id: string,
    data: {
      word?: string;
      definition?: string | null;
      example?: string | null;
      partOfSpeech?: string | null;
    }
  ): Promise<{
    id: string;
    word: string;
    definition: string | null;
    example: string | null;
    partOfSpeech: string | null;
  }>;
}

export const ENTRY_REPOSITORY = Symbol('ENTRY_REPOSITORY');
