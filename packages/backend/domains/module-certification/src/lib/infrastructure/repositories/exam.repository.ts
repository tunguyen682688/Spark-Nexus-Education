import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import {
  Prisma,
} from '@prisma/client';
import { ExamEntity } from '../../domain/entities/exam.entity';
import { ChapterEntity } from '../../domain/entities/chapter.entity';
import { ExamSectionEntity } from '../../domain/entities/exam-section.entity';
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
import { mapExamToEntity, mapChapterToEntity, mapSectionToEntity } from './mappers';

@Injectable()
export class ExamRepository {
  private readonly logger = new Logger(ExamRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findExams(queryParams?: QueryParams) {
    const normalizedParams = normalizeQueryParams(queryParams || {});
    const baseWhere: Prisma.ExamWhereInput = {
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

    const where: Prisma.ExamWhereInput =
      Object.keys(cleanedWhere).length > 0
        ? { AND: [baseWhere, cleanedWhere as Prisma.ExamWhereInput] }
        : baseWhere;

    const search = (normalizedParams as Record<string, unknown>)['q'] || normalizedParams.search;
    mergeSearchFilter(
      where as Record<string, unknown>,
      search as string | undefined,
      ['title']
    );

    const ALLOWED_EXAM_SORT_FIELDS = new Set([
      'id', 'collectionId', 'chapterId', 'title', 'description',
      'publishStatus', 'examType', 'certificationType', 'level',
      'order', 'createdAt', 'updatedAt', 'deletedAt',
      'duration', 'totalQuestions', 'maxScore', 'passScore',
    ]);
    const orderBy = sanitizeSortField(
      resolveOrderBy(prismaQuery.orderBy),
      ALLOWED_EXAM_SORT_FIELDS
    ) as Prisma.ExamOrderByWithRelationInput;

    const pagination = extractPagination(normalizedParams);
    const { page, limit } = derivePaginationMeta(pagination, prismaQuery.take);

    try {
      const [total, items] = await Promise.all([
        this.prisma.exam.count({ where }),
        this.prisma.exam.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

      return {
        items: items.map((item) => mapExamToEntity(item)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.warn(`findExams DB error: ${(error as Error)?.message || error}`);
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  async findExamById(id: string): Promise<ExamEntity | null> {
    try {
      const exam = await this.prisma.exam.findFirst({
        where: { id, deletedAt: null },
      });
      if (!exam) return null;
      return mapExamToEntity(exam);
    } catch (error) {
      this.logger.warn(`findExamById(${id}) DB error: ${(error as Error)?.message || error}`);
      return null;
    }
  }

  async findExamsByCollectionId(collectionId: string): Promise<ExamEntity[]> {
    try {
      const exams = await this.prisma.exam.findMany({
        where: { collectionId, deletedAt: null },
        orderBy: { order: 'asc' },
      });
      return exams.map((exam) => mapExamToEntity(exam));
    } catch (error) {
      this.logger.warn(`findExamsByCollectionId(${collectionId}) DB error: ${(error as Error)?.message || error}`);
      return [];
    }
  }

  async saveExam(exam: ExamEntity): Promise<ExamEntity> {
    const data = {
      title: exam.getTitle(),
      description: exam.getDescription(),
      duration: exam.getDuration(),
      totalQuestions: exam.getTotalQuestions(),
      maxScore: exam.getMaxScore(),
      passScore: exam.getPassScore(),
      publishStatus: exam.getPublishStatus(),
      certificationType: exam.getCertificationType(),
      examType: exam.getExamType(),
      level: exam.getLevel(),
      collectionId: exam.getCollectionId(),
      chapterId: exam.getChapterId(),
      order: exam.getOrder(),
      createdBy: exam.getCreatedBy(),
      updatedBy: exam.getUpdatedBy(),
      deletedAt: exam.getDeletedAt(),
      version: exam.version + BigInt(1),
    };

    const saved = await this.prisma.exam.upsert({
      where: { id: exam.id },
      create: {
        id: exam.id,
        ...data,
      },
      update: data,
    });

    return mapExamToEntity(saved);
  }

  async deleteExam(id: string): Promise<void> {
    await this.prisma.exam.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findExamsByChapterId(chapterId: string): Promise<ExamEntity[]> {
    const exams = await this.prisma.exam.findMany({
      where: { chapterId, deletedAt: null },
      orderBy: { order: 'asc' },
    });
    return exams.map((e) => mapExamToEntity(e));
  }

  async updateExamChapterId(examId: string, chapterId: string | null): Promise<void> {
    await this.prisma.exam.update({
      where: { id: examId },
      data: { chapterId },
    });
  }

  async updateExamOrder(examId: string, order: number): Promise<void> {
    await this.prisma.exam.update({
      where: { id: examId },
      data: { order },
    });
  }

  async updateExamInitializationStatus(examId: string, status: string): Promise<void> {
    await this.prisma.exam.updateMany({
      where: { id: examId },
      data: { initializationStatus: status },
    });
  }

  async findChapterById(id: string): Promise<ChapterEntity | null> {
    const chapter = await this.prisma.chapter.findFirst({
      where: { id, deletedAt: null },
    });
    return chapter ? mapChapterToEntity(chapter) : null;
  }

  async findChaptersByCollectionId(collectionId: string): Promise<ChapterEntity[]> {
    const chapters = await this.prisma.chapter.findMany({
      where: { collectionId, deletedAt: null },
      orderBy: { order: 'asc' },
    });
    return chapters.map((ch) => mapChapterToEntity(ch));
  }

  async saveChapter(chapter: ChapterEntity): Promise<ChapterEntity> {
    const data = {
      collectionId: chapter.getCollectionId(),
      title: chapter.getTitle(),
      description: chapter.getDescription(),
      order: chapter.getOrder(),
      createdBy: chapter.getCreatedBy(),
      updatedBy: chapter.getUpdatedBy(),
      deletedAt: chapter.getDeletedAt(),
    };

    const saved = await this.prisma.chapter.upsert({
      where: { id: chapter.id },
      create: { id: chapter.id, ...data },
      update: data,
    });

    return mapChapterToEntity(saved);
  }

  async deleteChapter(id: string): Promise<void> {
    await this.prisma.chapter.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findSectionsByExamId(examId: string): Promise<ExamSectionEntity[]> {
    const sections = await this.prisma.examSection.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });
    return sections.map((s) => mapSectionToEntity(s));
  }

  async findSectionById(id: string): Promise<ExamSectionEntity | null> {
    const section = await this.prisma.examSection.findUnique({
      where: { id },
    });
    return section ? mapSectionToEntity(section) : null;
  }

  async saveExamSection(section: ExamSectionEntity): Promise<ExamSectionEntity> {
    const data = {
      examId: section.getExamId(),
      title: section.getTitle(),
      subtitle: section.getSubtitle(),
      sectionType: section.getSectionType(),
      instruction: section.getInstruction(),
      order: section.getOrder(),
      durationMinutes: section.getDurationMinutes(),
      questionCount: section.getQuestionCount(),
      isBreak: section.getIsBreak(),
      audioMediaId: section.getAudioMediaId(),
      scriptText: section.getScriptText(),
      passageText: section.getPassageText(),
      passageTitle: section.getPassageTitle(),
      passageType: section.getPassageType(),
    };

    const saved = await this.prisma.examSection.upsert({
      where: { id: section.id },
      create: {
        id: section.id,
        ...data,
      },
      update: data,
    });

    return mapSectionToEntity(saved);
  }

  async deleteExamSection(id: string): Promise<void> {
    await this.prisma.examSection.delete({ where: { id } });
  }

  async updateSectionMetadata(sectionId: string, data: {
    title?: string;
    subtitle?: string | null;
    instruction?: string | null;
    order?: number;
    durationMinutes?: number;
    questionCount?: number;
  }): Promise<void> {
    const updateData: Prisma.ExamSectionUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.instruction !== undefined) updateData.instruction = data.instruction;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.questionCount !== undefined) updateData.questionCount = data.questionCount;

    if (Object.keys(updateData).length > 0) {
      await this.prisma.examSection.update({
        where: { id: sectionId },
        data: updateData,
      });
    }
  }

  async deleteAllSectionsByExamId(examId: string): Promise<void> {
    await this.prisma.examSection.deleteMany({ where: { examId } });
  }
}
