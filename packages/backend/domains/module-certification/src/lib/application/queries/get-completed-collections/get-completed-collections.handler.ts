import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetCompletedCollectionsQuery } from './get-completed-collections.query';

@QueryHandler(GetCompletedCollectionsQuery)
export class GetCompletedCollectionsQueryHandler
  implements IQueryHandler<GetCompletedCollectionsQuery>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCompletedCollectionsQuery): Promise<Record<string, unknown>[]> {
    const results = await this.repository.findResultsByUserId(query.userId);
    const passedResults = results.filter((r) => r.isPassed());

    const seenCollectionIds = new Set<string>();
    const completedCollections: Record<string, unknown>[] = [];

    for (const result of passedResults) {
      const exam = await this.repository.findExamById(result.getExamId());
      if (!exam) continue;

      const collectionId = exam.getCollectionId();
      if (seenCollectionIds.has(collectionId)) continue;
      seenCollectionIds.add(collectionId);

      const collection = await this.repository.findCollectionById(collectionId);
      if (!collection) continue;

      completedCollections.push({
        collectionId,
        collection: {
          id: collection.id,
          title: collection.getTitle(),
          description: collection.getDescription(),
          ownerId: collection.getOwnerId(),
        },
        exam: {
          id: exam.id,
          title: exam.getTitle(),
          passScore: exam.getPassScore(),
        },
        result: {
          id: result.id,
          totalScore: result.getTotalScore(),
          passed: result.isPassed(),
          createdAt: result.createdAt,
        },
      });
    }

    return completedCollections;
  }
}
