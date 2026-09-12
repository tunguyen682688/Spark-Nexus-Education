import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import * as crypto from 'crypto';
import {
  Collection,
  CollectionItem,
  Exam,
  Prisma,
} from '@prisma/client';
import { CollectionEntity } from '../../domain/entities/collection.entity';
import {
  buildPrismaQuery,
  normalizeQueryParams,
  extractPagination,
  QueryParams,
} from '@spark-nest-ed/shared-libs';
import {
  stripKeys,
  sanitizeSortField,
  resolveOrderBy,
  derivePaginationMeta,
  mergeSearchFilter,
} from './query-helpers';
import { mapCollectionToEntity } from './mappers';

@Injectable()
export class CollectionRepository {
  private readonly logger = new Logger(CollectionRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findCollections(queryParams?: QueryParams) {
    const normalizedParams = normalizeQueryParams(queryParams || {});
    const baseWhere: Prisma.CollectionWhereInput = {
      publishStatus: 'published',
      deletedAt: null,
    };

    const prismaQuery = buildPrismaQuery(normalizedParams, {
      maxLimit: 100,
      defaultLimit: 20,
    });

    const cleanedWhere = stripKeys(
      { ...prismaQuery.where } as Record<string, unknown>,
      ['exam']
    );

    const where: Prisma.CollectionWhereInput =
      Object.keys(cleanedWhere).length > 0
        ? { AND: [baseWhere, cleanedWhere as Prisma.CollectionWhereInput] }
        : baseWhere;

    const search = (normalizedParams as Record<string, unknown>)['q'] || normalizedParams.search;
    mergeSearchFilter(
      where as Record<string, unknown>,
      search as string | undefined,
      ['title']
    );

    const ALLOWED_COLLECTION_SORT_FIELDS = new Set([
      'id', 'title', 'description', 'subtitle', 'level', 'tags',
      'visibility', 'coverImage', 'ownerId', 'publishStatus',
      'createdAt', 'updatedAt', 'deletedAt',
    ]);
    const orderBy = sanitizeSortField(
      resolveOrderBy(prismaQuery.orderBy),
      ALLOWED_COLLECTION_SORT_FIELDS
    ) as Prisma.CollectionOrderByWithRelationInput;

    const pagination = extractPagination(normalizedParams);
    const { page, limit } = derivePaginationMeta(pagination, prismaQuery.take);

    try {
      const [total, items] = await Promise.all([
        this.prisma.collection.count({ where }),
        this.prisma.collection.findMany({
          where,
          include: { items: true, exams: true },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

      return {
        items: items.map((item) => mapCollectionToEntity(item)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.warn(`findCollections DB error: ${(error as Error)?.message || error}`);
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  async findCollectionById(id: string): Promise<CollectionEntity | null> {
    try {
      const col = await this.prisma.collection.findFirst({
        where: { id, deletedAt: null },
        include: {
          items: true,
          exams: true,
        },
      });
      if (!col) return null;
      return mapCollectionToEntity(col);
    } catch (error) {
      this.logger.warn(`findCollectionById(${id}) DB error: ${(error as Error)?.message || error}`);
      return null;
    }
  }

  async saveCollection(collection: CollectionEntity): Promise<CollectionEntity> {
    const data = {
      title: collection.getTitle(),
      description: collection.getDescription(),
      subtitle: collection.getSubtitle(),
      level: collection.getLevel(),
      tags: collection.getTags(),
      visibility: collection.getVisibility(),
      allowDownloads: collection.getAllowDownloads(),
      coverImage: collection.getCoverImage(),
      ownerId: collection.getOwnerId(),
      publishStatus: collection.getPublishStatus(),
      createdBy: collection.getCreatedBy(),
      updatedBy: collection.getUpdatedBy(),
      deletedAt: collection.getDeletedAt(),
      version: collection.version + BigInt(1),
    };

    const saved = await this.prisma.collection.upsert({
      where: { id: collection.id },
      create: {
        id: collection.id,
        ...data,
      },
      update: data,
    });

    return mapCollectionToEntity(saved);
  }

  async cloneCollection(sourceCollectionId: string, newOwnerId: string): Promise<CollectionEntity> {
    const source = await this.prisma.collection.findFirst({
      where: { id: sourceCollectionId, deletedAt: null },
      include: {
        exams: {
          include: {
            sections: true,
            examQuestions: true,
          },
        },
      },
    });
    if (!source) {
      throw new Error(`Source collection ${sourceCollectionId} not found`);
    }

    const newCollectionId = crypto.randomUUID();

    const newCollection = await this.prisma.collection.create({
      data: {
        id: newCollectionId,
        title: `${source.title} (Copy)`,
        description: source.description,
        subtitle: source.subtitle,
        level: source.level,
        tags: source.tags,
        visibility: source.visibility,
        allowDownloads: source.allowDownloads,
        coverImage: source.coverImage,
        ownerId: newOwnerId,
        createdBy: newOwnerId,
        updatedBy: newOwnerId,
        publishStatus: 'draft',
        version: BigInt(1),
      },
    });

    const examIdMap = new Map<string, string>();
    await Promise.all(
      source.exams.map(async (exam) => {
        const newExamId = crypto.randomUUID();
        examIdMap.set(exam.id, newExamId);
        await this.prisma.exam.create({
          data: {
            id: newExamId,
            title: exam.title,
            description: exam.description,
            collectionId: newCollectionId,
            duration: exam.duration,
            totalQuestions: exam.totalQuestions,
            maxScore: exam.maxScore,
            passScore: exam.passScore,
            publishStatus: exam.publishStatus,
            createdBy: newOwnerId,
            updatedBy: newOwnerId,
            version: BigInt(1),
          },
        });
      }),
    );

    await Promise.all(
      source.exams.map(async (exam) => {
        const newExamId = examIdMap.get(exam.id)!;

        const sectionIdMap = new Map<string, string>();
        await Promise.all(
          exam.sections.map(async (section) => {
            const newSectionId = crypto.randomUUID();
            sectionIdMap.set(section.id, newSectionId);
            await this.prisma.examSection.create({
              data: {
                id: newSectionId,
                examId: newExamId,
                title: section.title,
                subtitle: section.subtitle,
                instruction: section.instruction,
                order: section.order,
                durationMinutes: section.durationMinutes,
                questionCount: section.questionCount,
                isBreak: section.isBreak,
                createdBy: newOwnerId,
                updatedBy: newOwnerId,
              },
            });
          }),
        );

        await Promise.all(
          exam.examQuestions.map(async (eq) => {
            const newSectionId = eq.sectionId ? sectionIdMap.get(eq.sectionId) ?? null : null;
            await this.prisma.examQuestion.create({
              data: {
                id: crypto.randomUUID(),
                examId: newExamId,
                questionId: eq.questionId,
                sectionId: newSectionId,
                order: eq.order,
                points: eq.points,
                createdBy: newOwnerId,
                updatedBy: newOwnerId,
              },
            });
          }),
        );
      }),
    );

    return mapCollectionToEntity({
      ...newCollection,
      items: [],
      exams: [],
    } as Collection & { items?: CollectionItem[]; exams?: Exam[] });
  }

  async findClonedCollectionsByUserId(userId: string) {
    return this.getCollectionsWithCounts(userId);
  }

  async findCollectionsByOwnerId(userId: string) {
    return this.getCollectionsWithCounts(userId);
  }

  private async getCollectionsWithCounts(userId: string) {
    const collections = await this.prisma.collection.findMany({
      where: { ownerId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const collectionIds = collections.map((c) => c.id);

    const [examCounts, itemCounts] = await Promise.all([
      collectionIds.length > 0
        ? this.prisma.exam.groupBy({
            by: ['collectionId'],
            where: { collectionId: { in: collectionIds }, deletedAt: null },
            _count: { id: true },
          })
        : [],
      collectionIds.length > 0
        ? this.prisma.collectionItem.groupBy({
            by: ['collectionId'],
            where: { collectionId: { in: collectionIds } },
            _count: { id: true },
          })
        : [],
    ]);

    const examCountMap = new Map(examCounts.map((e) => [e.collectionId, e._count.id]));
    const itemCountMap = new Map(itemCounts.map((i) => [i.collectionId, i._count.id]));

    return collections.map((c) => ({
      id: c.id,
      ownerId: c.ownerId,
      title: c.title,
      description: c.description,
      publishStatus: c.publishStatus,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      examCount: examCountMap.get(c.id) ?? 0,
      itemCount: itemCountMap.get(c.id) ?? 0,
    }));
  }

  async deleteCollection(id: string): Promise<void> {
    await this.prisma.collection.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findActivitiesByCollectionId(
    collectionId: string,
    limit = 10
  ): Promise<Array<{ user: string; action: string; time: string }>> {
    const exams = await this.prisma.exam.findMany({
      where: { collectionId },
      select: { id: true, title: true },
    });

    if (exams.length === 0) {
      return [];
    }

    const examIds = exams.map((e) => e.id);
    const examMap = new Map(exams.map((e) => [e.id, e.title]));

    const results = await this.prisma.examResult.findMany({
      where: { examId: { in: examIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    if (results.length === 0) {
      const sessions = await this.prisma.examSession.findMany({
        where: { examId: { in: examIds } },
        orderBy: { startedAt: 'desc' },
        take: limit,
      });

      return sessions.map((s) => {
        const examTitle = examMap.get(s.examId) || 'Practice Exam';
        const agoMins = Math.max(1, Math.floor((Date.now() - s.startedAt.getTime()) / 60000));
        const timeStr = agoMins < 60 ? `${agoMins} mins ago` : `${Math.floor(agoMins / 60)} hours ago`;
        return {
          user: `Learner ${s.userId.substring(0, 5)}`,
          action: `started ${examTitle}`,
          time: timeStr,
        };
      });
    }

    return results.map((r) => {
      const examTitle = examMap.get(r.examId) || 'Exam';
      const agoMins = Math.max(1, Math.floor((Date.now() - r.createdAt.getTime()) / 60000));
      const timeStr = agoMins < 60 ? `${agoMins} mins ago` : `${Math.floor(agoMins / 60)} hours ago`;
      return {
        user: `Learner ${r.userId.substring(0, 5)}`,
        action: `completed ${examTitle} with score ${r.totalScore}`,
        time: timeStr,
      };
    });
  }
}
