import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetSavedCollectionsQuery } from './get-saved-collections.query';

@QueryHandler(GetSavedCollectionsQuery)
export class GetSavedCollectionsQueryHandler implements IQueryHandler<GetSavedCollectionsQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetSavedCollectionsQuery) {
    const bookmarks = await this.repository.findBookmarksWithCollectionsByUserId(query.userId);

    const collections = bookmarks
      .filter((b): b is typeof b & { collection: NonNullable<typeof b.collection> } => b.collection !== null)
      .map((b) => {
        const col = b.collection;
        let exam = 'IELTS';
        const upperTitle = col.title.toUpperCase();
        if (upperTitle.includes('TOEIC')) exam = 'TOEIC';
        else if (upperTitle.includes('TOEFL')) exam = 'TOEFL';
        else if (upperTitle.includes('CAMBRIDGE') || upperTitle.includes('CAE')) exam = 'Cambridge';
        else if (upperTitle.includes('VSTEP')) exam = 'VSTEP';
        else if (upperTitle.includes('SAT')) exam = 'SAT';

        return {
          id: col.id,
          ownerId: col.ownerId,
          title: col.title,
          subtitle: col.description || '',
          description: col.description || '',
          author: '',
          publishStatus: col.publishStatus,
          createdAt: b.createdAt,
          updatedAt: b.createdAt,
          exam,
          level: 'Intermediate',
          examCount: col.examCount,
          itemsCount: col.itemCount,
          tags: [exam, 'Intermediate'],
        };
      });

    return {
      items: collections,
      total: collections.length,
      page: 1,
      limit: collections.length,
      totalPages: 1,
    };
  }
}
