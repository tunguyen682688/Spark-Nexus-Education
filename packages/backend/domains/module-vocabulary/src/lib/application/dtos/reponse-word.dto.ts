import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Minimum Word DTO - Basic information only
 * Used for list views and minimal data transfer
 */
export class WordMinimumDto {
  @ApiProperty({ description: 'Word ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ description: 'The vocabulary word', example: 'hello' })
  word!: string;

  @ApiPropertyOptional({ description: 'Definition of the word', example: 'A greeting' })
  definition?: string | null;

  @ApiPropertyOptional({ description: 'Example sentence', example: 'Hello, how are you?' })
  example?: string | null;

  @ApiPropertyOptional({ description: 'Pronunciation guide', example: '/həˈloʊ/' })
  pronunciation?: string | null;

  @ApiPropertyOptional({ description: 'Part of speech', example: 'interjection' })
  partOfSpeech?: string | null;
}

/**
 * Sense DTO - Represents a meaning/definition of a word
 */
export class SenseDto {
  @ApiProperty({ description: 'Sense ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ description: 'Definition/meaning', example: 'A greeting used when meeting someone' })
  definition!: string;

  @ApiPropertyOptional({ description: 'Part of speech for this sense', example: 'noun' })
  partOfSpeech?: string | null;

  @ApiPropertyOptional({ description: 'Difficulty level', example: 'beginner' })
  level?: string | null;

  @ApiPropertyOptional({ description: 'Topic category', example: 'greetings' })
  topic?: string | null;

  @ApiPropertyOptional({ description: 'Synonym', example: 'hi' })
  synonym?: string | null;

  @ApiPropertyOptional({ description: 'Antonym', example: 'goodbye' })
  antonym?: string | null;

  @ApiPropertyOptional({ description: 'Usage notes', example: 'Informal greeting' })
  usage?: string | null;

  @ApiPropertyOptional({ description: 'Etymology information' })
  etymologyText?: string | null;

  @ApiPropertyOptional({ description: 'Field of study', example: 'linguistics' })
  fieldOfStudy?: string | null;

  @ApiPropertyOptional({ description: 'Additional notes' })
  note?: string | null;

  @ApiPropertyOptional({ description: 'See also references' })
  seeAlso?: string | null;

  @ApiPropertyOptional({ description: 'Related images', type: [String] })
  images?: string[];
}

/**
 * Example DTO - Example sentence for a word
 */
export class ExampleDto {
  @ApiProperty({ description: 'Example ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ description: 'Example sentence', example: 'Hello, how are you today?' })
  exampleText!: string;

  @ApiPropertyOptional({ description: 'Translation of the example' })
  translation?: string | null;
}

/**
 * Expression DTO - Phrase/idiom related to the word
 */
export class ExpressionDto {
  @ApiProperty({ description: 'Expression ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ description: 'Expression text', example: 'say hello' })
  expression!: string;

  @ApiPropertyOptional({ description: 'Meanings of the expression', type: [Object] })
  meanings?: Array<{
    id: string;
    meaningText: string;
    meaningOrder: number;
    usageNotes?: string | null;
  }>;
}

/**
 * Lexical Variant DTO - Word forms and variations
 */
export class LexicalVariantDto {
  @ApiProperty({ description: 'Variant ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiPropertyOptional({ description: 'Part of speech for this variant' })
  partOfSpeech?: string | null;

  @ApiPropertyOptional({ description: 'Pronunciation for this variant' })
  pronunciation?: string | null;

  @ApiPropertyOptional({ description: 'Notes about this variant' })
  notes?: string | null;
}

/**
 * Full Word DTO - Complete information with all relationships
 * Used for detail views and comprehensive data transfer
 */
export class WordFullDto {
  @ApiProperty({ description: 'Word ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ description: 'The vocabulary word', example: 'hello' })
  word!: string;

  @ApiProperty({ description: 'Language code', example: 'en' })
  language!: string;

  @ApiPropertyOptional({ description: 'Pronunciation guide', example: '/həˈloʊ/' })
  pronunciation?: string | null;

  @ApiPropertyOptional({ description: 'Part of speech', example: 'interjection' })
  partOfSpeech?: string | null;

  @ApiProperty({ description: 'Word frequency', example: 1000 })
  frequency!: number;

  @ApiProperty({ description: 'Is draft', example: false })
  isDraft!: boolean;

  @ApiProperty({ description: 'Is published', example: true })
  isPublished!: boolean;

  @ApiPropertyOptional({ description: 'Additional notes' })
  notes?: string | null;

  @ApiPropertyOptional({ description: 'Source URL' })
  sourceUrl?: string | null;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Audio URL for pronunciation' })
  audioUrl?: string | null;

  @ApiProperty({ description: 'All senses (meanings) of the word', type: [SenseDto] })
  senses!: SenseDto[];

  @ApiProperty({ description: 'Example sentences', type: [ExampleDto] })
  examples!: ExampleDto[];

  @ApiPropertyOptional({ description: 'Related expressions/idioms', type: [ExpressionDto] })
  expressions?: ExpressionDto[];

  @ApiPropertyOptional({ description: 'Lexical variants (word forms)', type: [LexicalVariantDto] })
  lexicalVariants?: LexicalVariantDto[];

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt!: Date;
}

/**
 * Vocabulary Set Item DTO - Word within a vocabulary set context
 * Combines word information with set-specific data
 */
export class VocabularySetItemDto {
  @ApiProperty({ description: 'Set item ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ description: 'Entry ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  entryId!: string;

  @ApiProperty({ description: 'Vocabulary set ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  vocabularySetId!: string;

  /**
   * ===== Dictionary data vs. user custom data =====
   *
   * - Dictionary/base word data comes from Entry and is exposed via:
   *   - wordMinimum  (WordMinimumDto)  – used for list views (default)
   *   - wordDetails  (WordFullDto)    – used for detailed views when requested
   *
   * - Per-user / per-set overrides are exposed as "custom*" fields below.
   *   These represent the user's own wording and meanings inside the set.
   */

  @ApiPropertyOptional({
    description:
      'User custom word text inside the set (if user overrides the base dictionary word)',
    example: 'Hello (formal)',
  })
  customWord?: string | null;

  @ApiPropertyOptional({
    description:
      'User custom meaning/definition inside the set (separate from the base dictionary definition)',
  })
  customDefinition?: string | null;

  @ApiPropertyOptional({
    description:
      'User custom example sentence inside the set (separate from dictionary examples)',
  })
  customExample?: string | null;

  @ApiPropertyOptional({ description: 'Personal notes for this word in the set' })
  notes?: string | null;

  @ApiPropertyOptional({ description: 'Position in the set (for ordering)', example: 1 })
  position?: number | null;

  @ApiProperty({ description: 'When this word was added to the set' })
  addedAt!: Date;

  @ApiPropertyOptional({ description: 'Full word details (if requested)', type: WordFullDto })
  wordDetails?: WordFullDto;

  @ApiPropertyOptional({ description: 'Minimum word details (if requested)', type: WordMinimumDto })
  wordMinimum?: WordMinimumDto;

  @ApiPropertyOptional({ description: 'User learning progress for this word in the set', type: () => Object, nullable: true })
  userProgress?: any;
}

/**
 * Response DTO for paginated vocabulary set words
 */
export class VocabularySetWordsResponseDto {
  @ApiProperty({ description: 'Vocabulary set items', type: [VocabularySetItemDto] })
  data!: VocabularySetItemDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  @ApiPropertyOptional({ description: 'Pagination links' })
  links?: {
    self?: string;
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}
