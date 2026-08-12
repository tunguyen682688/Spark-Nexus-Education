import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetCollectionActivitiesQuery } from './get-collection-activities.query';

@QueryHandler(GetCollectionActivitiesQuery)
export class GetCollectionActivitiesQueryHandler implements IQueryHandler<GetCollectionActivitiesQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCollectionActivitiesQuery) {
    return this.repository.findActivitiesByCollectionId(query.collectionId, query.limit);
  }
}
