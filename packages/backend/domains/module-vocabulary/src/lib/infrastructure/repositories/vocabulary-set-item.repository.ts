import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { VocabularySetItemEntity } from '../../domain/entities/vocabulary-set-item.entity';
import * as vocabularySetItemRepositoryInterface from '../../domain/repositories/vocabulary-set-item.repository.interface';
import {
  QueryParams,
  buildPrismaQuery,
  extractPagination,
  normalizeQueryParams,
  sanitizeLimit,
  sanitizePage,
  PagePagination,
  OffsetPagination,
} from '@spark-nest-ed/shared-libs';

/**
 * VocabularySetItemRepository
 * Prisma implementation of IVocabularySetItemRepository
 *
 * Responsibilities:
 * - Convert between Prisma models and Domain entities
 * - Execute database queries via PrismaService
 * - Handle item ordering and position management
 */
@Injectable()
export class VocabularySetItemRepository
  implements vocabularySetItemRepositoryInterface.IVocabularySetItemRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    item: VocabularySetItemEntity
  ): Promise<VocabularySetItemEntity> {
    const data = {
      id: item.getId(),
      entryId: item.getEntryId(),
      vocabularySetId: item.getVocabularySetId(),
      word: item.getWord(),
      definition: item.getDefinition(),
      example: item.getExample(),
      notes: item.getNotes(),
      position: item.getPosition(),
      deleted: item.isDeleted(),
      version: item.getVersion(),
    };

    const created = await this.prisma.vocabularySetItem.create({ data });
    return this.toDomain(created);
  }

  async createMany(
    items: VocabularySetItemEntity[]
  ): Promise<VocabularySetItemEntity[]> {
    if (items.length === 0) {
      return [];
    }

    const data = items.map((item) => ({
      id: item.getId(),
      entryId: item.getEntryId(),
      vocabularySetId: item.getVocabularySetId(),
      word: item.getWord(),
      definition: item.getDefinition(),
      example: item.getExample(),
      notes: item.getNotes(),
    }));

    await this.prisma.vocabularySetItem.createMany({ data });

    // Fetch created items to return as entities
    const createdIds = items.map((item) => item.getId());
    const created = await this.prisma.vocabularySetItem.findMany({
      where: { id: { in: createdIds } },
    });

    return created.map((item) => this.toDomain(item));
  }

  async createManyInTransaction(
    tx: unknown,
    items: VocabularySetItemEntity[]
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const data = items.map((item) => ({
      id: item.getId(),
      entryId: item.getEntryId(),
      vocabularySetId: item.getVocabularySetId(),
      word: item.getWord(),
      definition: item.getDefinition(),
      example: item.getExample(),
      notes: item.getNotes(),
      position: item.getPosition(),
      deleted: item.isDeleted(),
      version: item.getVersion(),
    }));

    const txClient = tx as {
      vocabularySetItem: {
        createMany: (args: {
          data: unknown[];
          skipDuplicates: boolean;
        }) => Promise<unknown>;
      };
    };
    await txClient.vocabularySetItem.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findByVocabularySetId(
    vocabularySetId: string,
    queryParams?: QueryParams
  ): Promise<{
    items: VocabularySetItemEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Normalize query params
    const normalizedParams = normalizeQueryParams(queryParams || {});
    
    // Filter out includeDetails from the filters array
    const filters = normalizedParams.filters || [];
    const cleanedFilters = filters.filter((f) => {
      // Check if it's a BaseFilterCondition with field 'includeDetails'
      return !('field' in f && f.field === 'includeDetails');
    });
    
    // Update normalizedParams with cleaned filters
    const cleanedParams = {
        ...normalizedParams,
        filters: cleanedFilters
    };

    // Build base where clause (always filter by vocabularySetId and not deleted)
    const baseWhere = {
      vocabularySetId,
      deleted: false,
    };

    // Build Prisma query from QueryParams
    const prismaQuery = buildPrismaQuery(cleanedParams, {
      maxLimit: 100,
      defaultLimit: 20,
    });

    // Merge base where with query filters
    // If query has filters, combine with base filters using AND
    const where =
      prismaQuery.where && Object.keys(prismaQuery.where).length > 0
        ? {
            AND: [baseWhere, prismaQuery.where],
          }
        : baseWhere;

    // Default orderBy if not specified in query
    // Prisma orderBy can be object (single field) or array (multiple fields)
    const orderBy =
      prismaQuery.orderBy &&
      (Array.isArray(prismaQuery.orderBy)
        ? prismaQuery.orderBy.length > 0
        : Object.keys(prismaQuery.orderBy).length > 0)
        ? prismaQuery.orderBy
        : [
            { position: 'asc' },
            { addedAt: 'desc' },
          ];

    // Extract pagination info for response
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
      page = Math.floor(offsetPagination.offset / limit) + 1;
    } else {
      page = 1;
      limit = prismaQuery.take || 20;
    }

    // Execute query
    const [items, total] = await Promise.all([
      this.prisma.vocabularySetItem.findMany({
        where,
        orderBy,
        skip: prismaQuery.skip,
        take: prismaQuery.take,
      }),
      this.prisma.vocabularySetItem.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toDomain(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<VocabularySetItemEntity | null> {
    const item = await this.prisma.vocabularySetItem.findUnique({
      where: { id },
    });
    return item ? this.toDomain(item) : null;
  }

  async findBySetAndEntryId(
    vocabularySetId: string,
    entryId: string
  ): Promise<VocabularySetItemEntity | null> {
    const item = await this.prisma.vocabularySetItem.findUnique({
      where: {
        vocabularySetId_entryId: {
          vocabularySetId,
          entryId,
        },
      },
    });
    return item ? this.toDomain(item) : null;
  }

  async update(
    item: VocabularySetItemEntity
  ): Promise<VocabularySetItemEntity> {
    const data = item.toPersistence();
    const updated = await this.prisma.vocabularySetItem.update({
      where: { id: data.id },
      data: {
        entryId: data.entryId,
        vocabularySetId: data.vocabularySetId,
        word: data.word,
        definition: data.definition,
        example: data.example,
        notes: data.notes,
        position: data.position,
        deleted: data.deleted,
        version: data.version,
      },
    });
    return this.toDomain(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.vocabularySetItem.update({
      where: { id },
      data: { deleted: true },
    });
  }

  /**
   * Convert Prisma model to Domain entity
   */
  private toDomain(prismaItem: {
    id: string;
    entryId: string;
    vocabularySetId: string;
    word: string;
    definition: string | null;
    example: string | null;
    notes: string | null;
    position: number | null;
    addedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    version: bigint | number;
  }): VocabularySetItemEntity {
    return VocabularySetItemEntity.fromPersistence({
      id: prismaItem.id,
      entryId: prismaItem.entryId,
      vocabularySetId: prismaItem.vocabularySetId,
      word: prismaItem.word,
      definition: prismaItem.definition,
      example: prismaItem.example,
      notes: prismaItem.notes,
      position: prismaItem.position,
      addedAt: prismaItem.addedAt,
      createdAt: prismaItem.createdAt,
      updatedAt: prismaItem.updatedAt,
      deleted: prismaItem.deleted,
      version: Number(prismaItem.version), // Convert BigInt to number
    });
  }
}
