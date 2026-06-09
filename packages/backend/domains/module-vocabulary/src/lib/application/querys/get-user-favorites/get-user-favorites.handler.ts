import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  normalizeQueryParams,
  SortDirection,
  ResponseMeta,
} from '@spark-nest-ed/shared-libs';
import { VocabularySetResponseDto } from '../../dtos/reponse-vocabulary-set.dto';
import {
  UserFavoritesListResult,
  GetUserFavoritesQuery,
} from './get-user-favorites.query';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';
import { VocabularySetEntity } from '../../../domain/entities/vocabulary-set.entity';
import { GetUsersProfilesQuery } from '@spark-nest-ed/module-user';

@QueryHandler(GetUserFavoritesQuery)
export class GetUserFavoritesQueryHandler
  implements IQueryHandler<GetUserFavoritesQuery, UserFavoritesListResult>
{
  constructor(
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    private readonly queryBus: QueryBus
  ) {}

  async execute(
    query: GetUserFavoritesQuery
  ): Promise<UserFavoritesListResult> {
    const normalizedParams = normalizeQueryParams(query.params || {});

    // Set default sorting if not provided (by favorited date desc)
    if (!normalizedParams.sort || normalizedParams.sort.length === 0) {
      normalizedParams.sort = [
        { field: 'createdAt', direction: SortDirection.DESC },
      ];
    }

    const result = await this.vocabularySetRepository.findFavoritesByUserId(
      query.userId,
      normalizedParams
    );

    // Fetch creators in bulk using QueryBus
    const creatorIds = [
      ...new Set(result.items.map((item) => item.getUserId())),
    ];
    let creatorMap = new Map<string, { name: string | null; avatar: string | null }>();

    if (creatorIds.length > 0) {
      try {
        const creators = await this.queryBus.execute<GetUsersProfilesQuery, any[]>(
          new GetUsersProfilesQuery(creatorIds)
        );
        if (creators && Array.isArray(creators)) {
          creatorMap = new Map(
            creators.map((c) => [c.id, { name: c.name, avatar: c.picture }])
          );
        }
      } catch (error) {
        // Gracefully fail and fallback
        console.error('Failed to fetch creator profiles from module-user:', error);
      }
    }

    const meta: ResponseMeta = {
      version: '1.0.0',
      message: 'User favorite vocabulary sets retrieved successfully',
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return {
      data: result.items.map((item) => this.toResponseDto(item, creatorMap)),
      meta,
    };
  }

  private toResponseDto(
    entity: VocabularySetEntity,
    creatorMap: Map<string, { name: string | null; avatar: string | null }>
  ): VocabularySetResponseDto {
    const creatorId = entity.getUserId();
    const creatorProfile = creatorMap.get(creatorId);

    return {
      id: entity.getId(),
      title: entity.getTitle(),
      description: entity.getDescription(),
      language: entity.getLanguage().getValue(),
      type: entity.getType().getValue(),
      difficulty: entity.getDifficulty()?.getValue() || null,
      isPublic: entity.getIsPublic(),
      isActive: entity.getIsActive(),
      tags: entity.getTags(),
      coverImage: entity.getCoverImage(),
      userId: creatorId,
      creator: {
        id: creatorId,
        name: creatorProfile?.name || this.extractUserDisplayName(creatorId),
        avatar: creatorProfile?.avatar || null,
      },
      entryCount: entity.getEntryCount(),
      favoriteCount: entity.getFavoriteCount(),
      studyCount: entity.getStudyCount(),
      importStatus: entity.getImportStatus(),
      importProgress: entity.getImportProgress(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }

  private extractUserDisplayName(userId: string): string {
    const parts = userId.split('|');
    return parts.length > 1 ? parts[1] : userId;
  }
}

