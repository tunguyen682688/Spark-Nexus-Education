import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetClonedCollectionsQuery } from './get-cloned-collections.query';

@QueryHandler(GetClonedCollectionsQuery)
export class GetClonedCollectionsQueryHandler implements IQueryHandler<GetClonedCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetClonedCollectionsQuery) {
    const result = await this.repository.findClonedCollectionsByUserId(query.userId);

    const items = (result || []).map((col) => ({
      id: col.id,
      title: col.title,
      description: col.description || '',
      ownerId: col.ownerId,
      publishStatus: col.publishStatus,
      createdAt: col.createdAt,
      examCount: col.examCount,
      itemCount: col.itemCount,
    }));

    return {
      items,
      total: items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    };
  }
}
