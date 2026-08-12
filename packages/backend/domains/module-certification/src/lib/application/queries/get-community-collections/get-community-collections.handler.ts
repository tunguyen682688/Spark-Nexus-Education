import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SortDirection } from '@spark-nest-ed/shared-libs';
import { GetCommunityCollectionsQuery } from './get-community-collections.query';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';

@QueryHandler(GetCommunityCollectionsQuery)
export class GetCommunityCollectionsQueryHandler implements IQueryHandler<GetCommunityCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCommunityCollectionsQuery) {
    const finalParams = query.queryParams ? { ...query.queryParams } : {};
    delete (finalParams as Record<string, unknown>).sort;
    finalParams.sortBy = 'createdAt';
    finalParams.sortDirection = SortDirection.DESC;
    const result = await this.repository.findCollections(finalParams);
    return result;
  }
}
