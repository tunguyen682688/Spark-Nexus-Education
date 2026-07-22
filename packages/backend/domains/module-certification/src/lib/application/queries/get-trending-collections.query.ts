import { IQuery } from '@nestjs/cqrs';
import { QueryParams } from '@spark-nest-ed/shared-libs';

export class GetTrendingCollectionsQuery implements IQuery {
  constructor(public readonly queryParams?: QueryParams) {}
}
