import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetInProgressSessionsQuery } from './get-in-progress-sessions.query';

@QueryHandler(GetInProgressSessionsQuery)
export class GetInProgressSessionsQueryHandler implements IQueryHandler<GetInProgressSessionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetInProgressSessionsQuery) {
    return this.repository.findInProgressSessionsByUserId(query.userId);
  }
}
