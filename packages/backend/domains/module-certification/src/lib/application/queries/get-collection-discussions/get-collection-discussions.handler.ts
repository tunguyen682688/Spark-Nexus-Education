import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetCollectionDiscussionsQuery } from './get-collection-discussions.query';

@QueryHandler(GetCollectionDiscussionsQuery)
export class GetCollectionDiscussionsQueryHandler
  implements IQueryHandler<GetCollectionDiscussionsQuery>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCollectionDiscussionsQuery) {
    const discussions = await this.repository.findDiscussionsByCollectionId(
      query.collectionId
    );

    const items = discussions.map((d) => ({
      id: d.id,
      collectionId: d.collectionId,
      userId: d.userId,
      title: d.title,
      content: d.content,
      repliesCount: (d as unknown as { _count?: { replies: number } })._count?.replies ?? 0,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    return {
      items,
      total: items.length,
    };
  }
}
