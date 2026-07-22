import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetOfficialCollectionsQuery } from './get-official-collections.query';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';

@QueryHandler(GetOfficialCollectionsQuery)
export class GetOfficialCollectionsQueryHandler implements IQueryHandler<GetOfficialCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetOfficialCollectionsQuery) {
    // Query database for official published collections with pagination
    const result = await this.repository.findCollections(query.queryParams);
    return result;
  }
}
