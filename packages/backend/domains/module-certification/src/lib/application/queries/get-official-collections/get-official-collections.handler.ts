import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SortDirection } from '@spark-nest-ed/shared-libs';
import { GetOfficialCollectionsQuery } from './get-official-collections.query';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';

@QueryHandler(GetOfficialCollectionsQuery)
export class GetOfficialCollectionsQueryHandler implements IQueryHandler<GetOfficialCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetOfficialCollectionsQuery) {
    const finalParams = query.queryParams ? { ...query.queryParams } : {};
    finalParams.sortBy = 'examCount';
    finalParams.sortDirection = SortDirection.DESC;
    const result = await this.repository.findCollections(finalParams);
    return result;
  }
}
