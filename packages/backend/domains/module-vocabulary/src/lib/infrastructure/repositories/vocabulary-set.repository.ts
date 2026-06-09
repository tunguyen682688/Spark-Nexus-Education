import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { VocabularySetEntity } from '../../domain/entities/vocabulary-set.entity';
import * as vocabularySetRepositoryInterface from '../../domain/repositories/vocabulary-set.repository.interface';
import { Prisma } from '@prisma/client';
import {
  buildPrismaQuery,
  QueryParams,
  normalizeQueryParams,
  extractPagination,
  sanitizeLimit,
  sanitizePage,
  PagePagination,
  OffsetPagination,
} from '@spark-nest-ed/shared-libs';

/**
 * VocabularySetRepository
 * Prisma implementation of IVocabularySetRepository
 *
 * Responsibilities:
 * - Convert between Prisma models and Domain entities
 * - Execute database queries via PrismaService
 * - Handle filtering, sorting, and pagination
 */
@Injectable()
export class VocabularySetRepository
  implements vocabularySetRepositoryInterface.IVocabularySetRepository
{
  constructor(private readonly prisma: PrismaService) {}
  async findCommunityVocabularySets(queryParams?: QueryParams) {
    const normalizedParams = normalizeQueryParams(queryParams || {});

    // Base filters to ensure only community shared sets are returned
    // isPublic: true, isActive: true, deleted: false
    // These are enforced at the repository level and cannot be overridden
    const baseWhere = {
      isPublic: true,
      isActive: true,
      deleted: false,
    };

    const prismaQuery = buildPrismaQuery(normalizedParams, {
      maxLimit: 100,
      defaultLimit: 20,
    });

    // Merge base filters with query filters using AND
    const where =
      prismaQuery.where && Object.keys(prismaQuery.where).length > 0
        ? {
            AND: [baseWhere, prismaQuery.where],
          }
        : baseWhere;

    // Ensure default ordering if none provided
    const orderBy =
      prismaQuery.orderBy &&
      (Array.isArray(prismaQuery.orderBy)
        ? prismaQuery.orderBy.length > 0
        : Object.keys(prismaQuery.orderBy).length > 0)
        ? prismaQuery.orderBy
        : [
            { favoriteCount: 'desc' },
            { entryCount: 'desc' },
            { createdAt: 'desc' },
          ];

    const pagination = extractPagination(normalizedParams);
    let page: number;
    let limit: number;

    if (pagination && 'page' in pagination) {
      const pagePagination = pagination as PagePagination;
      page = sanitizePage(pagePagination.page);
      limit = sanitizeLimit(pagePagination.pageSize, 100, 20);
    } else if (pagination && 'offset' in pagination) {
      const offsetPagination = pagination as OffsetPagination;
      limit = sanitizeLimit(offsetPagination.limit, 100, 20);
      page = Math.floor(offsetPagination.offset / Math.max(limit, 1)) + 1;
    } else {
      page = 1;
      limit = prismaQuery.take || 20;
    }

    const [items, total] = await Promise.all([
      this.prisma.vocabularySet.findMany({
        where,
        orderBy,
        skip: prismaQuery.skip,
        take: prismaQuery.take,
      }),
      this.prisma.vocabularySet.count({ where }),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      items: items.map((item) => this.toDomain(item)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(
    vocabularySet: VocabularySetEntity
  ): Promise<VocabularySetEntity> {
    const data = {
      id: vocabularySet.getId(),
      title: vocabularySet.getTitle(),
      description: vocabularySet.getDescription(),
      language: vocabularySet.getLanguage().getValue(),
      type: vocabularySet.getType().getValue(),
      difficulty: vocabularySet.getDifficulty()?.getValue() || null,
      isPublic: vocabularySet.getIsPublic(),
      isActive: vocabularySet.getIsActive(),
      tags: vocabularySet.getTags(),
      coverImage: vocabularySet.getCoverImage(),
      userId: vocabularySet.getUserId(),
      entryCount: vocabularySet.getEntryCount(),
      favoriteCount: vocabularySet.getFavoriteCount(),
      studyCount: vocabularySet.getStudyCount(),
      importStatus: vocabularySet.getImportStatus(),
      importProgress: vocabularySet.getImportProgress()
        ? (vocabularySet.getImportProgress() as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      deleted: vocabularySet.isDeleted(),
      version: vocabularySet.getVersion(),
    };

    const created = await this.prisma.vocabularySet.create({ data });
    return this.toDomain(created);
  }

  async update(
    vocabularySet: VocabularySetEntity
  ): Promise<VocabularySetEntity> {
    const data = {
      title: vocabularySet.getTitle(),
      description: vocabularySet.getDescription(),
      difficulty: vocabularySet.getDifficulty()?.getValue() || null,
      isPublic: vocabularySet.getIsPublic(),
      isActive: vocabularySet.getIsActive(),
      tags: vocabularySet.getTags(),
      coverImage: vocabularySet.getCoverImage(),
      entryCount: vocabularySet.getEntryCount(),
      favoriteCount: vocabularySet.getFavoriteCount(),
      studyCount: vocabularySet.getStudyCount(),
      importStatus: vocabularySet.getImportStatus(),
      importProgress: vocabularySet.getImportProgress()
        ? (vocabularySet.getImportProgress() as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      deleted: vocabularySet.isDeleted(),
      version: vocabularySet.getVersion(),
    };

    const updated = await this.prisma.vocabularySet.update({
      where: { id: vocabularySet.getId() },
      data,
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<VocabularySetEntity | null> {
    const set = await this.prisma.vocabularySet.findUnique({
      where: { id },
    });

    return set ? this.toDomain(set) : null;
  }

  async createInTransaction(
    tx: unknown,
    vocabularySet: VocabularySetEntity
  ): Promise<VocabularySetEntity> {
    const data = {
      id: vocabularySet.getId(),
      title: vocabularySet.getTitle(),
      description: vocabularySet.getDescription(),
      language: vocabularySet.getLanguage().getValue(),
      type: vocabularySet.getType().getValue(),
      difficulty: vocabularySet.getDifficulty()?.getValue() || null,
      isPublic: vocabularySet.getIsPublic(),
      isActive: vocabularySet.getIsActive(),
      tags: vocabularySet.getTags(),
      coverImage: vocabularySet.getCoverImage(),
      userId: vocabularySet.getUserId(),
      entryCount: vocabularySet.getEntryCount(),
      favoriteCount: vocabularySet.getFavoriteCount(),
      studyCount: vocabularySet.getStudyCount(),
      importStatus: vocabularySet.getImportStatus(),
      importProgress: vocabularySet.getImportProgress()
        ? (vocabularySet.getImportProgress() as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      deleted: vocabularySet.isDeleted(),
      version: vocabularySet.getVersion(),
    };

    const txClient = tx as {
      vocabularySet: {
        create: (args: { data: unknown }) => Promise<{
          id: string;
          title: string;
          description: string | null;
          language: string;
          type: string;
          difficulty: string | null;
          isPublic: boolean;
          isActive: boolean;
          tags: string[];
          coverImage: string | null;
          userId: string;
          entryCount: number;
          favoriteCount: number;
          studyCount: number;
          importStatus?: string | null;
          importProgress?: unknown;
          createdAt: Date;
          updatedAt: Date;
          deleted: boolean;
          version: bigint | number;
        }>;
      };
    };
    const created = await txClient.vocabularySet.create({ data });
    return this.toDomain(created);
  }

  async updateEntryCountInTransaction(
    tx: unknown,
    setId: string,
    count: number
  ): Promise<void> {
    const txClient = tx as {
      vocabularySet: {
        update: (args: {
          where: { id: string };
          data: { entryCount: number };
        }) => Promise<unknown>;
      };
    };
    await txClient.vocabularySet.update({
      where: { id: setId },
      data: { entryCount: count },
    });
  }

  /**
   * Find vocabulary sets created by a specific user
   */
  async findByUserId(userId: string, queryParams?: QueryParams) {
    const normalizedParams = normalizeQueryParams(queryParams || {});

    // Base filters: user's sets that are not deleted
    const baseWhere = {
      userId,
      deleted: false,
    };

    const prismaQuery = buildPrismaQuery(normalizedParams, {
      maxLimit: 100,
      defaultLimit: 20,
    });

    // Merge base filters with query filters
    const where =
      prismaQuery.where && Object.keys(prismaQuery.where).length > 0
        ? {
            AND: [baseWhere, prismaQuery.where],
          }
        : baseWhere;

    // Default ordering by createdAt desc
    const orderBy =
      prismaQuery.orderBy &&
      (Array.isArray(prismaQuery.orderBy)
        ? prismaQuery.orderBy.length > 0
        : Object.keys(prismaQuery.orderBy).length > 0)
        ? prismaQuery.orderBy
        : [{ createdAt: 'desc' }];

    const pagination = extractPagination(normalizedParams);
    let page: number;
    let limit: number;

    if (pagination && 'page' in pagination) {
      const pagePagination = pagination as PagePagination;
      page = sanitizePage(pagePagination.page);
      limit = sanitizeLimit(pagePagination.pageSize, 100, 20);
    } else if (pagination && 'offset' in pagination) {
      const offsetPagination = pagination as OffsetPagination;
      limit = sanitizeLimit(offsetPagination.limit, 100, 20);
      page = Math.floor(offsetPagination.offset / Math.max(limit, 1)) + 1;
    } else {
      page = 1;
      limit = prismaQuery.take || 20;
    }

    const [items, total] = await Promise.all([
      this.prisma.vocabularySet.findMany({
        where,
        orderBy,
        skip: prismaQuery.skip,
        take: prismaQuery.take,
      }),
      this.prisma.vocabularySet.count({ where }),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      items: items.map((item) => this.toDomain(item)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find vocabulary sets favorited by a specific user
   */
  async findFavoritesByUserId(userId: string, queryParams?: QueryParams) {
    const normalizedParams = normalizeQueryParams(queryParams || {});

    const prismaQuery = buildPrismaQuery(normalizedParams, {
      maxLimit: 100,
      defaultLimit: 20,
    });

    const pagination = extractPagination(normalizedParams);
    let page: number;
    let limit: number;

    if (pagination && 'page' in pagination) {
      const pagePagination = pagination as PagePagination;
      page = sanitizePage(pagePagination.page);
      limit = sanitizeLimit(pagePagination.pageSize, 100, 20);
    } else if (pagination && 'offset' in pagination) {
      const offsetPagination = pagination as OffsetPagination;
      limit = sanitizeLimit(offsetPagination.limit, 100, 20);
      page = Math.floor(offsetPagination.offset / Math.max(limit, 1)) + 1;
    } else {
      page = 1;
      limit = prismaQuery.take || 20;
    }

    // Get favorited vocabulary set IDs for this user
    const favorites = await this.prisma.userVocabularySetFavorite.findMany({
      where: {
        userId,
        deleted: false,
      },
      select: {
        vocabularySetId: true,
        favoritedAt: true,
      },
      orderBy: { favoritedAt: 'desc' },
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    });

    const favoriteSetIds = favorites.map((f) => f.vocabularySetId);

    if (favoriteSetIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Get the vocabulary sets with query filters
    const baseWhere: Prisma.VocabularySetWhereInput = {
      id: { in: favoriteSetIds },
      deleted: false,
      isActive: true,
    };

    const where =
      prismaQuery.where && Object.keys(prismaQuery.where).length > 0
        ? {
            AND: [baseWhere, prismaQuery.where],
          }
        : baseWhere;

    const [items, total] = await Promise.all([
      this.prisma.vocabularySet.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
      }),
      this.prisma.userVocabularySetFavorite.count({
        where: {
          userId,
          deleted: false,
        },
      }),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      items: items.map((item) => this.toDomain(item)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Check if a user has favorited a vocabulary set
   */
  async isFavorited(userId: string, vocabularySetId: string): Promise<boolean> {
    const favorite = await this.prisma.userVocabularySetFavorite.findUnique({
      where: {
        userId_vocabularySetId: {
          userId,
          vocabularySetId,
        },
      },
    });
    return favorite !== null && !favorite.deleted;
  }

  /**
   * Add vocabulary set to user's favorites
   */
  async addFavorite(userId: string, vocabularySetId: string): Promise<void> {
    // Check if favorite already exists and is active (not deleted)
    const existingFavorite = await this.prisma.userVocabularySetFavorite.findUnique({
      where: {
        userId_vocabularySetId: {
          userId,
          vocabularySetId,
        },
      },
    });

    const isNewFavorite = !existingFavorite || existingFavorite.deleted;

    // Upsert to handle re-favoriting after soft delete
    await this.prisma.userVocabularySetFavorite.upsert({
      where: {
        userId_vocabularySetId: {
          userId,
          vocabularySetId,
        },
      },
      update: {
        deleted: false,
        favoritedAt: new Date(),
      },
      create: {
        userId,
        vocabularySetId,
      },
    });

    // Only increment favorite count if this is a new favorite or restoring a deleted one
    if (isNewFavorite) {
      await this.prisma.vocabularySet.update({
        where: { id: vocabularySetId },
        data: { favoriteCount: { increment: 1 } },
      });
    }
  }

  /**
   * Remove vocabulary set from user's favorites
   */
  async removeFavorite(userId: string, vocabularySetId: string): Promise<void> {
    // Check if favorite exists and is active (not deleted)
    const existingFavorite = await this.prisma.userVocabularySetFavorite.findUnique({
      where: {
        userId_vocabularySetId: {
          userId,
          vocabularySetId,
        },
      },
    });

    // Only proceed if favorite exists and is not already deleted
    if (existingFavorite && !existingFavorite.deleted) {
      // Soft delete the favorite
      await this.prisma.userVocabularySetFavorite.update({
        where: {
          userId_vocabularySetId: {
            userId,
            vocabularySetId,
          },
        },
        data: { deleted: true },
      });

      // Decrement favorite count on the vocabulary set
      await this.prisma.vocabularySet.update({
        where: { id: vocabularySetId },
        data: { favoriteCount: { decrement: 1 } },
      });
    }
  }

  /**
   * Convert Prisma model to Domain entity
   * Public method for use in Saga and other services
   */
  toDomain(prismaSet: {
    id: string;
    title: string;
    description: string | null;
    language: string;
    type: string;
    difficulty: string | null;
    isPublic: boolean;
    isActive: boolean;
    tags: string[];
    coverImage: string | null;
    userId: string;
    entryCount: number;
    favoriteCount: number;
    studyCount: number;
    importStatus?: string | null;
    importProgress?: unknown;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: bigint | number;
  }): VocabularySetEntity {
    return VocabularySetEntity.fromPersistence({
      id: prismaSet.id,
      title: prismaSet.title,
      description: prismaSet.description,
      language: prismaSet.language,
      type: prismaSet.type,
      difficulty: prismaSet.difficulty,
      isPublic: prismaSet.isPublic,
      isActive: prismaSet.isActive,
      tags: prismaSet.tags || [],
      coverImage: prismaSet.coverImage,
      userId: prismaSet.userId,
      entryCount: prismaSet.entryCount,
      favoriteCount: prismaSet.favoriteCount,
      studyCount: prismaSet.studyCount,
      importStatus: prismaSet.importStatus,
      importProgress: prismaSet.importProgress as
        | VocabularySetEntity['importProgress']
        | null,
      createdAt: prismaSet.createdAt,
      updatedAt: prismaSet.updatedAt,
      deleted: prismaSet.deleted,
      version: Number(prismaSet.version), // Convert BigInt to number
    });
  }
}
