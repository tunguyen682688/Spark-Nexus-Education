import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ExamEntity } from '../../../domain/entities/exam.entity';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetCollectionItemsQuery } from './get-collection-items.query';

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

    const exams = await this.repository.findExamsByCollectionId(query.collectionId);

    const itemsList = exams.map((e: ExamEntity, index: number) => ({
      id: e.id,
      title: `${e.getTitle()} (Mock ${index + 1})`,
      type: 'Full Mock Test',
      duration: `${e.getDuration() || 60} mins`,
      items: `${e.getTotalQuestions() || 40} Questions`,
    }));

    return {
      collectionId: query.collectionId,
      totalItems: exams.length,
      itemsList,
      exams: exams.map((e: ExamEntity) => e.toPlainObject()),
    };
  }
}

export { GetCollectionItemsQueryHandler as GetCollectionItemsHandler };
