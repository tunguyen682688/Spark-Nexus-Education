import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCommunityCollectionsQuery } from './get-community-collections.query';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';

@QueryHandler(GetCommunityCollectionsQuery)
export class GetCommunityCollectionsQueryHandler implements IQueryHandler<GetCommunityCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCommunityCollectionsQuery) {
    const result = await this.repository.findCollections(query.queryParams);
    return result;
  }
}
