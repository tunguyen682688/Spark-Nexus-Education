import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetMyCollectionsQuery } from './get-my-collections.query';

@QueryHandler(GetMyCollectionsQuery)
export class GetMyCollectionsQueryHandler implements IQueryHandler<GetMyCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetMyCollectionsQuery) {
    const collections = await this.repository.findCollectionsByOwnerId(query.userId);

    const items = collections.map((col) => ({
      id: col.id,
      ownerId: col.ownerId,
      title: col.title,
      description: col.description || '',
      publishStatus: col.publishStatus,
      createdAt: col.createdAt,
      updatedAt: col.updatedAt,
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
