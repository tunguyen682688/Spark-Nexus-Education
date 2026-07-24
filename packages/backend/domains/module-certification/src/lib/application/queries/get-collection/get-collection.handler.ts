import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetCollectionQuery } from './get-collection.query';

@QueryHandler(GetCollectionQuery)
export class GetCollectionQueryHandler implements IQueryHandler<GetCollectionQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCollectionQuery): Promise<Record<string, unknown>> {
    const collection = await this.repository.findCollectionById(query.id);
    if (!collection) {
      throw new NotFoundException(`Collection with ID "${query.id}" was not found`);
    }

    const exams = await this.repository.findExamsByCollectionId(query.id);

    const title = collection.getTitle();
    const description = collection.getDescription() || '';

    // Infer exam category from title
    let exam = 'IELTS';
    const upperTitle = title.toUpperCase();
    if (upperTitle.includes('TOEIC')) exam = 'TOEIC';
    else if (upperTitle.includes('TOEFL')) exam = 'TOEFL';
    else if (
      upperTitle.includes('CAMBRIDGE') ||
      upperTitle.includes('CAE') ||
      upperTitle.includes('FCE')
    )
      exam = 'Cambridge';
    else if (upperTitle.includes('VSTEP')) exam = 'VSTEP';
    else if (upperTitle.includes('SAT')) exam = 'SAT';

    // Infer level
    let level = 'Intermediate';
    if (
      upperTitle.includes('900+') ||
      upperTitle.includes('ADVANCED') ||
      upperTitle.includes('C1') ||
      upperTitle.includes('C2')
    ) {
      level = 'Advanced';
    } else if (upperTitle.includes('B2') || upperTitle.includes('UPPER')) {
      level = 'Upper-Intermediate';
    } else if (
      upperTitle.includes('BEGINNER') ||
      upperTitle.includes('BASIC')
    ) {
      level = 'Beginner';
    }

    const itemsList = exams.map((e, index) => ({
      id: e.id,
      title: `${e.getTitle()} (Mock ${index + 1})`,
      type: 'Full Mock Test',
      duration: `${e.getDuration() || 60} mins`,
      items: `${e.getTotalQuestions() || 40} Questions`,
    }));

    const examCount = exams.length || collection.getExamCount();
    const itemsCount = collection.getItemCount() || itemsList.length;

    return {
      id: collection.id,
      title,
      subtitle: description,
      description,
      ownerId: collection.getOwnerId(),
      publishStatus: collection.getPublishStatus(),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      exam,
      level,
      examCount,
      itemsCount,
      exams: exams.map((e) => e.toPlainObject()),
      itemsList,
      reviewsList: [],
      activitiesList: [],
      tags: [exam, level],
    };
  }
}

export { GetCollectionQueryHandler as GetCollectionHandler };
