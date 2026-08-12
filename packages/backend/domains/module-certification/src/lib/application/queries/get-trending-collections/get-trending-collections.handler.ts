import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SortDirection } from '@spark-nest-ed/shared-libs';
import { GetTrendingCollectionsQuery } from './get-trending-collections.query';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';

@QueryHandler(GetTrendingCollectionsQuery)
export class GetTrendingCollectionsQueryHandler implements IQueryHandler<GetTrendingCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetTrendingCollectionsQuery) {
    const finalParams = query.queryParams ? { ...query.queryParams } : {};
    delete (finalParams as Record<string, unknown>).sort;
    finalParams.sortBy = 'updatedAt';
    finalParams.sortDirection = SortDirection.DESC;
    const result = await this.repository.findCollections(finalParams);
    return result;
  }
}
