import { IQuery } from '@nestjs/cqrs';
import { QueryParams } from '@spark-nest-ed/shared-libs';

export class GetFeaturedCollectionsQuery implements IQuery {
  constructor(
    public readonly exam?: string,
    public readonly search?: string,
    public readonly queryParams?: QueryParams
  ) {}
}
