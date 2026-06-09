import { Query } from '@nestjs/cqrs';
import { QueryParams, ResponseMeta } from '@spark-nest-ed/shared-libs';
import { VocabularySetResponseDto } from '../../dtos/reponse-vocabulary-set.dto';

export type GetUserFavoritesQueryParams = QueryParams;

export interface UserFavoritesListResult {
  data: VocabularySetResponseDto[];
  meta: ResponseMeta;
}

export class GetUserFavoritesQuery extends Query<UserFavoritesListResult> {
  constructor(
    public readonly userId: string,
    public readonly params?: GetUserFavoritesQueryParams
  ) {
    super();
  }
}

