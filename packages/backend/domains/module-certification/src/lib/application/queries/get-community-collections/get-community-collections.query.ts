import { Query } from '@nestjs/cqrs';
import { QueryParams } from '@spark-nest-ed/shared-libs';
import { PaginatedCollectionsResult } from '../paginated-collections-result.interface';

export class GetCommunityCollectionsQuery extends Query<PaginatedCollectionsResult> {
  constructor(public readonly queryParams?: QueryParams) {
    super();
  }
}
