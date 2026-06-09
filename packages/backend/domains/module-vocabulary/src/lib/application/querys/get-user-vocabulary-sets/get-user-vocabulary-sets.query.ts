import { Query } from '@nestjs/cqrs';
import { QueryParams, ResponseMeta } from '@spark-nest-ed/shared-libs';
import { VocabularySetResponseDto } from '../../dtos/reponse-vocabulary-set.dto';

export type GetUserVocabularySetsQueryParams = QueryParams;

export interface UserVocabularySetsListResult {
  data: VocabularySetResponseDto[];
  meta: ResponseMeta;
}

export class GetUserVocabularySetsQuery extends Query<UserVocabularySetsListResult> {
  constructor(
    public readonly userId: string,
    public readonly params?: GetUserVocabularySetsQueryParams
  ) {
    super();
  }
}

