import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetBookmarksQuery } from './get-bookmarks.query';

@QueryHandler(GetBookmarksQuery)
export class GetBookmarksQueryHandler implements IQueryHandler<GetBookmarksQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetBookmarksQuery): Promise<Record<string, unknown>[]> {
    const bookmarks = await this.repository.findBookmarksByUserId(query.userId);

    const results = await Promise.all(
      bookmarks.map(async (bm) => {
        const collection = await this.repository.findCollectionById(bm.collectionId);
        const exams = collection
          ? await this.repository.findExamsByCollectionId(bm.collectionId)
          : [];

        return {
          id: bm.id,
          collectionId: bm.collectionId,
          userId: bm.userId,
          createdAt: bm.createdAt,
          collection: collection
            ? {
                id: collection.id,
                title: collection.getTitle(),
                description: collection.getDescription(),
                ownerId: collection.getOwnerId(),
                publishStatus: collection.getPublishStatus(),
              }
            : null,
          exams: exams.map((e) => ({
            id: e.id,
            title: e.getTitle(),
            duration: e.getDuration(),
            totalQuestions: e.getTotalQuestions(),
          })),
        };
      })
    );

    return results;
  }
}
