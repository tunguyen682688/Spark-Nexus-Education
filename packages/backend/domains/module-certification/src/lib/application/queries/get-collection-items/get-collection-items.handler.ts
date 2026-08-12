import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetCollectionItemsQuery } from './get-collection-items.query';

const EXAM_TYPE_LABELS: Record<string, string> = {
  FULL_MOCK: 'Full Mock Test',
  MINI_TEST: 'Mini Test',
  SECTION_PRACTICE: 'Section Practice',
};

@QueryHandler(GetCollectionItemsQuery)
export class GetCollectionItemsQueryHandler
  implements IQueryHandler<GetCollectionItemsQuery>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCollectionItemsQuery) {
    const collection = await this.repository.findCollectionById(query.collectionId);
    if (!collection) {
      throw new NotFoundException(
        `Collection with ID "${query.collectionId}" was not found`
      );
    }

    const allExams = await this.repository.findExamsByCollectionId(query.collectionId);
    const exams = allExams.filter((e) => e.getPublishStatus() === 'published');

    const itemsList = exams.map((e) => ({
      id: e.id,
      title: e.getTitle(),
      type: EXAM_TYPE_LABELS[e.getExamType()] || 'Full Mock Test',
      duration: e.getDuration(),
      totalQuestions: e.getTotalQuestions(),
      certificationType: e.getCertificationType(),
    }));

    return {
      id: query.collectionId,
      collectionId: query.collectionId,
      totalItems: exams.length,
      itemsList,
    };
  }
}

export { GetCollectionItemsQueryHandler as GetCollectionItemsHandler };
