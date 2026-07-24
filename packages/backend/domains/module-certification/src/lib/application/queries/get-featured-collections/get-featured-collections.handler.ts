import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetFeaturedCollectionsQuery } from './get-featured-collections.query';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';

@QueryHandler(GetFeaturedCollectionsQuery)
export class GetFeaturedCollectionsQueryHandler implements IQueryHandler<GetFeaturedCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetFeaturedCollectionsQuery) {
    const { exam, search, queryParams } = query;

    const finalParams = queryParams ? { ...queryParams } : {};
    if (search || (exam && exam !== 'All')) {
      finalParams.search = search || (exam && exam !== 'All' ? exam : undefined);
    }

    const result = await this.repository.findCollections(finalParams);
    return result;
  }
}
