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

    const [exams, creator] = await Promise.all([
      this.repository.findExamsByCollectionId(query.id),
      this.repository.findCreatorProfileByUserId(collection.getOwnerId()),
    ]);

    const title = collection.getTitle();
    const description = collection.getDescription() || '';
    const author = creator ? creator.getDisplayName() : `Author ${collection.getOwnerId().substring(0, 6)}`;

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

    const examCount = exams.length || collection.getExamCount();
    const itemsCount = collection.getItemCount() || exams.length;

    return {
      id: collection.id,
      title,
      subtitle: description,
      description,
      ownerId: collection.getOwnerId(),
      author,
      publishStatus: collection.getPublishStatus(),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      exam,
      level,
      examCount,
      itemsCount,
      tags: [exam, level],
    };
  }
}

export { GetCollectionQueryHandler as GetCollectionHandler };
