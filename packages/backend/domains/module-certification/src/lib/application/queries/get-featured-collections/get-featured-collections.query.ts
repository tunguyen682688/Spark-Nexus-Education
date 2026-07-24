import { Query } from '@nestjs/cqrs';
import { QueryParams } from '@spark-nest-ed/shared-libs';
import { PaginatedCollectionsResult } from '../paginated-collections-result.interface';

export class GetFeaturedCollectionsQuery extends Query<PaginatedCollectionsResult> {
  constructor(
    public readonly exam?: string,
    public readonly search?: string,
    public readonly queryParams?: QueryParams
  ) {
    super();
  }
}
