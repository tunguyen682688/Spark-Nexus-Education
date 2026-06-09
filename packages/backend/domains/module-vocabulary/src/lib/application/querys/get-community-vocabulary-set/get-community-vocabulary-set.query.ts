import { Query } from '@nestjs/cqrs';
import { QueryParams, ResponseMeta } from '@spark-nest-ed/shared-libs';
import { VocabularySetResponseDto } from '../../dtos/reponse-vocabulary-set.dto';

export type GetCommunityVocabularySetQueryParams = QueryParams;

export interface CommunityVocabularySetListResult {
  data: VocabularySetResponseDto[];
  meta: ResponseMeta;
}

export class GetCommunityVocabularySetQuery extends Query<CommunityVocabularySetListResult> {
  constructor(public readonly params?: GetCommunityVocabularySetQueryParams) {
    super();
  }
}