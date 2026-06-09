import { Query } from '@nestjs/cqrs';
import { VocabularySetWordsResponseDto } from '../../dtos/reponse-word.dto';
import { QueryParams } from '@spark-nest-ed/shared-libs';

/**
 * Extended query parameters for getting vocabulary set words
 * Extends base QueryParams with vocabulary-specific options
 */
export interface GetWordsVocabularySetQueryParams extends QueryParams {
  /**
   * Level of word details to include
   * - 'none': Only set item data (word, definition, example from set)
   * - 'minimum': Basic word info (word, definition, example, pronunciation, partOfSpeech)
   * - 'full': Complete word details with all relationships (senses, examples, expressions, lexical variants)
   */
  includeDetails?: 'minimum' | 'full' | 'none';
}

/**
 * Query to get words in a vocabulary set
 * Uses the standardized QueryParams system for filtering, sorting, and pagination
 */
export class GetWordsVocabularySetQuery extends Query<VocabularySetWordsResponseDto> {
  constructor(
    public readonly vocabularySetId: string,
    public readonly params?: GetWordsVocabularySetQueryParams,
    public readonly userId?: string
  ) {
    super();
  }
}
