import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetFavoritesQuery } from './get-favorites.query';

@QueryHandler(GetFavoritesQuery)
export class GetFavoritesQueryHandler implements IQueryHandler<GetFavoritesQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetFavoritesQuery): Promise<Record<string, unknown>[]> {
    const favorites = await this.repository.findFavoritesByUserId(query.userId);

    const results = await Promise.all(
      favorites.map(async (fav) => {
        const collection = await this.repository.findCollectionById(fav.collectionId);
        const exams = collection
          ? await this.repository.findExamsByCollectionId(fav.collectionId)
          : [];

        return {
          id: fav.id,
          collectionId: fav.collectionId,
          userId: fav.userId,
          createdAt: fav.createdAt,
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
