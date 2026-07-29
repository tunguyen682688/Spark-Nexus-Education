import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTopContributorsQuery } from './get-top-contributors.query';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';

@QueryHandler(GetTopContributorsQuery)
export class GetTopContributorsQueryHandler implements IQueryHandler<GetTopContributorsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(_query: GetTopContributorsQuery) {
    const creators = await this.repository.findCreatorProfiles(10);

    return creators.map((creator, index) => ({
      id: creator.id,
      rank: index + 1,
      name: creator.getDisplayName(),
      bio: creator.getBio() || '',
      userId: creator.getUserId(),
      status: creator.getStatus(),
      createdAt: creator.createdAt,
    }));
  }
}
