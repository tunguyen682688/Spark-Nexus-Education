import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTrendingCollectionsQuery } from './get-trending-collections.query';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';

@QueryHandler(GetTrendingCollectionsQuery)
export class GetTrendingCollectionsQueryHandler implements IQueryHandler<GetTrendingCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetTrendingCollectionsQuery) {
    const result = await this.repository.findCollections(query.queryParams);
    return result;
  }
}
