import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  normalizeQueryParams,
  SortDirection,
  ResponseMeta,
} from '@spark-nest-ed/shared-libs';
import { VocabularySetResponseDto } from '../../dtos/reponse-vocabulary-set.dto';
import {
  UserVocabularySetsListResult,
  GetUserVocabularySetsQuery,
} from './get-user-vocabulary-sets.query';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';
import { VocabularySetEntity } from '../../../domain/entities/vocabulary-set.entity';
import { GetUserProfileQuery } from '@spark-nest-ed/module-user';

@QueryHandler(GetUserVocabularySetsQuery)
export class GetUserVocabularySetsQueryHandler
  implements
    IQueryHandler<GetUserVocabularySetsQuery, UserVocabularySetsListResult>
{
  constructor(
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    private readonly queryBus: QueryBus
  ) {}

  async execute(
    query: GetUserVocabularySetsQuery
  ): Promise<UserVocabularySetsListResult> {
    const normalizedParams = normalizeQueryParams(query.params || {});

    // Set default sorting if not provided
    if (!normalizedParams.sort || normalizedParams.sort.length === 0) {
      normalizedParams.sort = [
        { field: 'createdAt', direction: SortDirection.DESC },
      ];
    }

    const result = await this.vocabularySetRepository.findByUserId(
      query.userId,
      normalizedParams
    );

    // Fetch user profile using QueryBus
    let creatorProfile: { name: string | null; avatar: string | null } | null = null;
    try {
      const creator = await this.queryBus.execute<GetUserProfileQuery, any>(
        new GetUserProfileQuery(query.userId)
      );
      if (creator) {
        creatorProfile = { name: creator.name, avatar: creator.picture };
      }
    } catch (error) {
      // Gracefully fail and fallback
      console.error(`Failed to fetch user profile for ID ${query.userId}:`, error);
    }

    const meta: ResponseMeta = {
      version: '1.0.0',
      message: 'User vocabulary sets retrieved successfully',
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };

    return {
      data: result.items.map((item) => this.toResponseDto(item, creatorProfile)),
      meta,
    };
  }

  private toResponseDto(
    entity: VocabularySetEntity,
    creatorProfile: { name: string | null; avatar: string | null } | null
  ): VocabularySetResponseDto {
    const creatorId = entity.getUserId();

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

