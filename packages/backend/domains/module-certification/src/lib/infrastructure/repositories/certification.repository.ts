import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import * as crypto from 'crypto';
import {
  Collection,
  CollectionItem,
  Exam,
  Chapter,
  ExamSection,
  ExamRule,
  ExamSession,
  ExamResult,
  Question,
  QuestionHint,
  QuestionMedia,
  SessionAnswer,
  ExamQuestion,
  QuestionChoice,
  SessionViolation,
  AutosaveSnapshot,
  SkillResult,
  QuestionResult,
  AiEvaluation,
  CreatorProfile,
  UserDownload,
  CollectionPurchase,
  CollectionReport,
  Prisma,
} from '@prisma/client';
import { CollectionEntity } from '../../domain/entities/collection.entity';
import { ExamEntity } from '../../domain/entities/exam.entity';
import { ChapterEntity } from '../../domain/entities/chapter.entity';
import { ExamSessionEntity } from '../../domain/entities/exam-session.entity';
import { ExamResultEntity } from '../../domain/entities/exam-result.entity';
import { ExamQuestionEntity } from '../../domain/entities/exam-question.entity';
import { QuestionChoiceEntity } from '../../domain/entities/question-choice.entity';
import { SessionAnswerEntity } from '../../domain/entities/session-answer.entity';
import { SessionViolationEntity } from '../../domain/entities/session-violation.entity';
import { ExamSectionEntity } from '../../domain/entities/exam-section.entity';
import { ExamRuleEntity } from '../../domain/entities/exam-rule.entity';
import { QuestionEntity } from '../../domain/entities/question.entity';
import { QuestionMetadataEntity } from '../../domain/entities/question-metadata.entity';
import { QuestionHintEntity } from '../../domain/entities/question-hint.entity';
import { QuestionMediaEntity } from '../../domain/entities/question-media.entity';
import { AutosaveSnapshotEntity } from '../../domain/entities/autosave-snapshot.entity';
import { SkillResultEntity } from '../../domain/entities/skill-result.entity';
import { QuestionResultEntity } from '../../domain/entities/question-result.entity';
import { AiEvaluationEntity } from '../../domain/entities/ai-evaluation.entity';
import { CreatorProfileEntity } from '../../domain/entities/creator-profile.entity';
import { ICertificationRepository } from '../../domain/repositories/certification.repository.interface';
import {
  buildPrismaQuery,
  normalizeQueryParams,
  extractPagination,
  sanitizeLimit,
  sanitizePage,
  PagePagination,
  OffsetPagination,
  QueryParams,
} from '@spark-nest-ed/shared-libs';

@Injectable()
export class CertificationRepository implements ICertificationRepository {
  private readonly logger = new Logger(CertificationRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // COLLECTION OPERATIONS
  // ============================================

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

    const rawWhere = { ...prismaQuery.where };
    delete (rawWhere as Record<string, unknown>).exam;

    const where: Prisma.CollectionWhereInput =
      Object.keys(rawWhere).length > 0
        ? {
            AND: [baseWhere, rawWhere as Prisma.CollectionWhereInput],
          }
        : baseWhere;

    if ((normalizedParams as Record<string, unknown>)['q'] || normalizedParams.search) {
      const searchTerm = ((normalizedParams as Record<string, unknown>)['q'] || normalizedParams.search) as string;
      where['title'] = { contains: searchTerm, mode: 'insensitive' };
    }

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

    try {
      const [total, items] = await Promise.all([
        this.prisma.collection.count({ where }),
        this.prisma.collection.findMany({
          where,
          include: {
            items: true,
            exams: true,
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

      return {
        items: items.map((item) => this.mapCollectionToEntity(item)),
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
      return this.mapCollectionToEntity(col);
    } catch (error) {
      this.logger.warn(`findCollectionById(${id}) DB error: ${(error as Error)?.message || error}`);
      return null;
    }
  }

  async saveCollection(collection: CollectionEntity): Promise<CollectionEntity> {
    const data = {
      title: collection.getTitle(),
      description: collection.getDescription(),
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

    return this.mapCollectionToEntity(saved);
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
        ownerId: newOwnerId,
        createdBy: newOwnerId,
        updatedBy: newOwnerId,
        publishStatus: 'draft',
        version: BigInt(1),
      },
    });

    for (const exam of source.exams) {
      const newExamId = crypto.randomUUID();

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

      for (const section of exam.sections) {
        await this.prisma.examSection.create({
          data: {
            id: crypto.randomUUID(),
            examId: newExamId,
            title: section.title,
            instruction: section.instruction,
            order: section.order,
            createdBy: newOwnerId,
            updatedBy: newOwnerId,
          },
        });
      }

      for (const eq of exam.examQuestions) {
        await this.prisma.examQuestion.create({
          data: {
            id: crypto.randomUUID(),
            examId: newExamId,
            questionId: eq.questionId,
            order: eq.order,
            points: eq.points,
            createdBy: newOwnerId,
            updatedBy: newOwnerId,
          },
        });
      }
    }

    return this.mapCollectionToEntity({
      ...newCollection,
      items: [],
      exams: [],
    } as Collection & { items?: CollectionItem[]; exams?: Exam[] });
  }

  async findClonedCollectionsByUserId(userId: string) {
    const collections = await this.prisma.collection.findMany({
      where: { ownerId: userId, deletedAt: null, publishStatus: 'draft' },
      orderBy: { createdAt: 'desc' },
    });

    const collectionIds = collections.map((c) => c.id);
    const examCounts = collectionIds.length > 0
      ? await this.prisma.exam.groupBy({
          by: ['collectionId'],
          where: { collectionId: { in: collectionIds }, deletedAt: null },
          _count: { id: true },
        })
      : [];
    const examCountMap = new Map(examCounts.map((e) => [e.collectionId, e._count.id]));

    const itemCounts = collectionIds.length > 0
      ? await this.prisma.collectionItem.groupBy({
          by: ['collectionId'],
          where: { collectionId: { in: collectionIds } },
          _count: { id: true },
        })
      : [];
    const itemCountMap = new Map(itemCounts.map((i) => [i.collectionId, i._count.id]));

    return collections.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      ownerId: c.ownerId,
      publishStatus: c.publishStatus,
      createdAt: c.createdAt,
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

  // ============================================
  // EXAM OPERATIONS
  // ============================================

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

    const rawWhere = { ...prismaQuery.where };
    delete (rawWhere as Record<string, unknown>).exam;

    const where: Prisma.ExamWhereInput =
      Object.keys(rawWhere).length > 0
        ? {
            AND: [baseWhere, rawWhere as Prisma.ExamWhereInput],
          }
        : baseWhere;

    if ((normalizedParams as Record<string, unknown>)['q'] || normalizedParams.search) {
      const searchTerm = ((normalizedParams as Record<string, unknown>)['q'] || normalizedParams.search) as string;
      where['title'] = { contains: searchTerm, mode: 'insensitive' };
    }

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
        items: items.map((item) => this.mapExamToEntity(item)),
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
      return this.mapExamToEntity(exam);
    } catch (error) {
      this.logger.warn(`findExamById(${id}) DB error: ${(error as Error)?.message || error}`);
      return null;
    }
  }

  async findExamsByCollectionId(collectionId: string): Promise<ExamEntity[]> {
    try {
      const exams = await this.prisma.exam.findMany({
        where: { collectionId, deletedAt: null, publishStatus: 'published' },
      });
      return exams.map((exam) => this.mapExamToEntity(exam));
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
      collectionId: exam.getCollectionId(),
      chapterId: exam.getChapterId(),
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

    return this.mapExamToEntity(saved);
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
      orderBy: { createdAt: 'asc' },
    });
    return exams.map((e) => this.mapExamToEntity(e));
  }

  async updateExamChapterId(examId: string, chapterId: string | null): Promise<void> {
    await this.prisma.exam.update({
      where: { id: examId },
      data: { chapterId },
    });
  }

  // ============================================
  // CHAPTER OPERATIONS
  // ============================================

  async findChaptersByCollectionId(collectionId: string): Promise<ChapterEntity[]> {
    const chapters = await this.prisma.chapter.findMany({
      where: { collectionId, deletedAt: null },
      orderBy: { order: 'asc' },
    });
    return chapters.map((ch) => this.mapChapterToEntity(ch));
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

    return this.mapChapterToEntity(saved);
  }

  async deleteChapter(id: string): Promise<void> {
    await this.prisma.chapter.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ============================================
  // EXAM SECTION OPERATIONS
  // ============================================

  async findSectionsByExamId(examId: string): Promise<ExamSectionEntity[]> {
    const sections = await this.prisma.examSection.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });
    return sections.map((s) => this.mapSectionToEntity(s));
  }

  async saveExamSection(section: ExamSectionEntity): Promise<ExamSectionEntity> {
    const data = {
      examId: section.getExamId(),
      title: section.getTitle(),
      instruction: section.getInstruction(),
      order: section.getOrder(),
    };

    const saved = await this.prisma.examSection.upsert({
      where: { id: section.id },
      create: {
        id: section.id,
        ...data,
      },
      update: data,
    });

    return this.mapSectionToEntity(saved);
  }

  async deleteExamSection(id: string): Promise<void> {
    await this.prisma.examSection.update({
      where: { id },
      data: { order: 0 }, // mark as deleted by resetting order; schema has no deletedAt
    });
  }

  // ============================================
  // EXAM RULE OPERATIONS
  // ============================================

  async findRulesByExamId(examId: string): Promise<ExamRuleEntity[]> {
    const rules = await this.prisma.examRule.findMany({
      where: { examId },
    });
    return rules.map((r) => this.mapRuleToEntity(r));
  }

  async saveExamRule(rule: ExamRuleEntity): Promise<ExamRuleEntity> {
    const data = {
      examId: rule.getExamId(),
      ruleType: rule.getRuleType(),
      ruleValue: rule.getRuleValue(),
      createdBy: rule.getCreatedBy(),
      updatedBy: rule.getUpdatedBy(),
    };

    const saved = await this.prisma.examRule.upsert({
      where: { id: rule.id },
      create: {
        id: rule.id,
        ...data,
      },
      update: data,
    });

    return this.mapRuleToEntity(saved);
  }

  async deleteExamRule(id: string): Promise<void> {
    await this.prisma.examRule.delete({
      where: { id },
    });
  }

  // ============================================
  // EXAM SESSION OPERATIONS
  // ============================================

  async findSessionById(id: string): Promise<ExamSessionEntity | null> {
    const session = await this.prisma.examSession.findUnique({
      where: { id },
      include: {
        answers: true,
        violations: true,
        snapshots: true,
      },
    });
    if (!session) return null;
    return this.mapSessionToEntity(session);
  }

  async saveSession(session: ExamSessionEntity): Promise<ExamSessionEntity> {
    const data = {
      examId: session.getExamId(),
      userId: session.getUserId(),
      status: session.getStatus(),
      startedAt: session.getStartedAt(),
      endedAt: session.getEndedAt(),
      version: session.version + BigInt(1),
    };

    const saved = await this.prisma.examSession.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        ...data,
      },
      update: data,
    });

    return this.mapSessionToEntity(saved);
  }

  async findSessionsByUserId(userId: string): Promise<ExamSessionEntity[]> {
    const sessions = await this.prisma.examSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });
    return sessions.map((s) => this.mapSessionToEntity(s));
  }

  async findInProgressSessionsByUserId(userId: string) {
    const sessions = await this.prisma.examSession.findMany({
      where: { userId, status: 'in_progress' },
      include: {
        exam: {
          select: { id: true, title: true, collectionId: true, duration: true, totalQuestions: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
    return sessions.map((s) => ({
      id: s.id,
      examId: s.examId,
      userId: s.userId,
      status: s.status,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      exam: s.exam ? { id: s.exam.id, title: s.exam.title, collectionId: s.exam.collectionId, duration: s.exam.duration, totalQuestions: s.exam.totalQuestions } : null,
    }));
  }

  // ============================================
  // EXAM RESULT OPERATIONS
  // ============================================

  async findResultById(id: string): Promise<ExamResultEntity | null> {
    const result = await this.prisma.examResult.findUnique({
      where: { id },
      include: {
        skills: true,
        questions: true,
        evaluation: true,
      },
    });
    if (!result) return null;
    return this.mapResultToEntity(result);
  }

  async findResultBySessionId(sessionId: string): Promise<ExamResultEntity | null> {
    const result = await this.prisma.examResult.findFirst({
      where: { sessionId },
      include: {
        skills: true,
        questions: true,
        evaluation: true,
      },
    });
    if (!result) return null;
    return this.mapResultToEntity(result);
  }

  async saveResult(result: ExamResultEntity): Promise<ExamResultEntity> {
    const data = {
      sessionId: result.getSessionId(),
      examId: result.getExamId(),
      userId: result.getUserId(),
      totalScore: result.getTotalScore(),
      passed: result.isPassed(),
    };

    const saved = await this.prisma.examResult.upsert({
      where: { id: result.id },
      create: {
        id: result.id,
        ...data,
      },
      update: data,
    });

    return this.mapResultToEntity(saved);
  }

  async findResultsByUserId(userId: string): Promise<ExamResultEntity[]> {
    const results = await this.prisma.examResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((r) => this.mapResultToEntity(r));
  }

  // ============================================
  // QUESTION OPERATIONS
  // ============================================

  async findQuestionById(id: string): Promise<QuestionEntity | null> {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: {
        choices: true,
        hints: true,
        media: true,
      },
    });
    if (!question) return null;
    return this.mapQuestionToEntity(question);
  }

  async findQuestionVersionsByQuestionId(questionId: string) {
    const versions = await this.prisma.questionVersion.findMany({
      where: { questionId },
      orderBy: { version: 'desc' },
    });
    return versions.map((v) => ({
      id: v.id,
      questionId: v.questionId,
      version: v.version,
      content: v.content,
      createdAt: v.createdAt,
      createdBy: v.createdBy,
    }));
  }

  async saveQuestion(question: QuestionEntity): Promise<QuestionEntity> {
    const data = {
      title: question.getTitle(),
      content: question.getContent(),
      type: question.getType(),
      difficulty: question.getDifficulty(),
      status: question.getStatus(),
      createdBy: question.getCreatedBy(),
      updatedBy: question.getUpdatedBy(),
      deletedAt: question.getDeletedAt(),
    };

    const saved = await this.prisma.question.upsert({
      where: { id: question.id },
      create: {
        id: question.id,
        ...data,
      },
      update: data,
    });

    return this.mapQuestionToEntity(saved);
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ============================================
  // QUESTION BUILDER OPERATIONS
  // ============================================

  async findQuestionWithBuilderData(id: string): Promise<{
    question: QuestionEntity;
    choices: QuestionChoiceEntity[];
    metadata: QuestionMetadataEntity | null;
  } | null> {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: {
        choices: { orderBy: { order: 'asc' } },
        metadata: true,
      },
    });

    if (!question) return null;

    return {
      question: this.mapQuestionToEntity(question),
      choices: question.choices.map((c) => this.mapChoiceToEntity(c)),
      metadata: question.metadata ? this.mapMetadataToEntity(question.metadata) : null,
    };
  }

  async saveQuestionWithChoices(
    question: QuestionEntity,
    choices: QuestionChoiceEntity[],
    metadata: QuestionMetadataEntity | null
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Upsert question
      await tx.question.upsert({
        where: { id: question.id },
        create: {
          id: question.id,
          title: question.getTitle(),
          content: question.getContent(),
          type: question.getType(),
          difficulty: question.getDifficulty(),
          status: question.getStatus(),
          createdBy: question.getCreatedBy(),
          updatedBy: question.getUpdatedBy(),
        },
        update: {
          title: question.getTitle(),
          content: question.getContent(),
          type: question.getType(),
          difficulty: question.getDifficulty(),
          status: question.getStatus(),
          updatedBy: question.getUpdatedBy(),
        },
      });

      // 2. Delete old choices and create new ones
      await tx.questionChoice.deleteMany({ where: { questionId: question.id } });
      if (choices.length > 0) {
        await tx.questionChoice.createMany({
          data: choices.map((c) => ({
            id: c.id,
            questionId: question.id,
            content: c.getContent(),
            isCorrect: c.getIsCorrect(),
            order: c.getOrder(),
            createdBy: c.getCreatedBy(),
            updatedBy: c.getUpdatedBy(),
          })),
        });
      }

      // 3. Upsert metadata
      if (metadata) {
        await tx.questionMetadata.upsert({
          where: { questionId: question.id },
          create: {
            id: metadata.id,
            questionId: question.id,
            explanation: metadata.getExplanation(),
            points: metadata.getPoints(),
            estimatedTime: metadata.getEstimatedTime(),
            shuffleOptions: metadata.getShuffleOptions(),
            referenceType: metadata.getReferenceType(),
            passageSource: metadata.getPassageSource(),
            highlight: metadata.getHighlight(),
            cognitiveLevel: metadata.getCognitiveLevel(),
            tags: metadata.getTags(),
            skills: metadata.getSkills(),
            qualityScore: metadata.getQualityScore(),
            qualityRating: metadata.getQualityRating(),
          },
          update: {
            explanation: metadata.getExplanation(),
            points: metadata.getPoints(),
            estimatedTime: metadata.getEstimatedTime(),
            shuffleOptions: metadata.getShuffleOptions(),
            referenceType: metadata.getReferenceType(),
            passageSource: metadata.getPassageSource(),
            highlight: metadata.getHighlight(),
            cognitiveLevel: metadata.getCognitiveLevel(),
            tags: metadata.getTags(),
            skills: metadata.getSkills(),
            qualityScore: metadata.getQualityScore(),
            qualityRating: metadata.getQualityRating(),
          },
        });
      }

      // 4. Create version snapshot
      const latestVersion = await tx.questionVersion.findFirst({
        where: { questionId: question.id },
        orderBy: { version: 'desc' },
      });
      const nextVersion = (latestVersion?.version ?? 0) + 1;
      await tx.questionVersion.create({
        data: {
          questionId: question.id,
          version: nextVersion,
          content: JSON.stringify({
            title: question.getTitle(),
            content: question.getContent(),
            type: question.getType(),
            difficulty: question.getDifficulty(),
            choices: choices.map((c) => ({
              id: c.id,
              content: c.getContent(),
              isCorrect: c.getIsCorrect(),
              order: c.getOrder(),
            })),
            metadata: metadata ? metadata.toPlainObject() : null,
          }),
          createdBy: question.getUpdatedBy() || question.getCreatedBy(),
        },
      });
    });
  }

  async deleteQuestionCascade(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.questionChoice.deleteMany({ where: { questionId: id } });
      await tx.questionHint.deleteMany({ where: { questionId: id } });
      await tx.questionMedia.deleteMany({ where: { questionId: id } });
      await tx.questionMetadata.deleteMany({ where: { questionId: id } });
      await tx.questionVersion.deleteMany({ where: { questionId: id } });
      await tx.question.delete({ where: { id } });
    });
  }

  // ============================================
  // QUESTION METADATA OPERATIONS
  // ============================================

  async findMetadataByQuestionId(questionId: string): Promise<QuestionMetadataEntity | null> {
    const metadata = await this.prisma.questionMetadata.findUnique({
      where: { questionId },
    });
    if (!metadata) return null;
    return this.mapMetadataToEntity(metadata);
  }

  async saveQuestionMetadata(metadata: QuestionMetadataEntity): Promise<QuestionMetadataEntity> {
    const saved = await this.prisma.questionMetadata.upsert({
      where: { questionId: metadata.getQuestionId() },
      create: {
        id: metadata.id,
        questionId: metadata.getQuestionId(),
        explanation: metadata.getExplanation(),
        points: metadata.getPoints(),
        estimatedTime: metadata.getEstimatedTime(),
        shuffleOptions: metadata.getShuffleOptions(),
        referenceType: metadata.getReferenceType(),
        passageSource: metadata.getPassageSource(),
        highlight: metadata.getHighlight(),
        cognitiveLevel: metadata.getCognitiveLevel(),
        tags: metadata.getTags(),
        skills: metadata.getSkills(),
        qualityScore: metadata.getQualityScore(),
        qualityRating: metadata.getQualityRating(),
      },
      update: {
        explanation: metadata.getExplanation(),
        points: metadata.getPoints(),
        estimatedTime: metadata.getEstimatedTime(),
        shuffleOptions: metadata.getShuffleOptions(),
        referenceType: metadata.getReferenceType(),
        passageSource: metadata.getPassageSource(),
        highlight: metadata.getHighlight(),
        cognitiveLevel: metadata.getCognitiveLevel(),
        tags: metadata.getTags(),
        skills: metadata.getSkills(),
        qualityScore: metadata.getQualityScore(),
        qualityRating: metadata.getQualityRating(),
      },
    });

    return this.mapMetadataToEntity(saved);
  }

  // ============================================
  // QUESTION CHOICE OPERATIONS
  // ============================================

  async saveQuestionChoice(choice: QuestionChoiceEntity): Promise<QuestionChoiceEntity> {
    const data = {
      questionId: choice.getQuestionId(),
      content: choice.getContent(),
      isCorrect: choice.getIsCorrect(),
      order: choice.getOrder(),
      createdBy: choice.getCreatedBy(),
      updatedBy: choice.getUpdatedBy(),
      version: choice.version + BigInt(1),
    };

    const saved = await this.prisma.questionChoice.upsert({
      where: { id: choice.id },
      create: {
        id: choice.id,
        ...data,
      },
      update: data,
    });

    return this.mapChoiceToEntity(saved);
  }

  async deleteQuestionChoice(id: string): Promise<void> {
    await this.prisma.questionChoice.delete({
      where: { id },
    });
  }

  // ============================================
  // QUESTION HINT OPERATIONS
  // ============================================

  async findHintsByQuestionId(questionId: string): Promise<QuestionHintEntity[]> {
    const hints = await this.prisma.questionHint.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });
    return hints.map((h) => this.mapHintToEntity(h));
  }

  async saveQuestionHint(hint: QuestionHintEntity): Promise<QuestionHintEntity> {
    const data = {
      questionId: hint.getQuestionId(),
      content: hint.getContent(),
      order: hint.getOrder(),
      createdBy: hint.getCreatedBy(),
      updatedBy: hint.getUpdatedBy(),
      version: hint.version + BigInt(1),
    };

    const saved = await this.prisma.questionHint.upsert({
      where: { id: hint.id },
      create: {
        id: hint.id,
        ...data,
      },
      update: data,
    });

    return this.mapHintToEntity(saved);
  }

  async deleteQuestionHint(id: string): Promise<void> {
    await this.prisma.questionHint.delete({
      where: { id },
    });
  }

  // ============================================
  // QUESTION MEDIA OPERATIONS
  // ============================================

  async findMediaByQuestionId(questionId: string): Promise<QuestionMediaEntity[]> {
    const media = await this.prisma.questionMedia.findMany({
      where: { questionId },
    });
    return media.map((m) => this.mapMediaToEntity(m));
  }

  async saveQuestionMedia(media: QuestionMediaEntity): Promise<QuestionMediaEntity> {
    const data = {
      questionId: media.getQuestionId(),
      mediaUrl: media.getMediaUrl(),
      mediaType: media.getMediaType(),
      createdBy: media.getCreatedBy(),
      updatedBy: media.getUpdatedBy(),
      version: media.version + BigInt(1),
    };

    const saved = await this.prisma.questionMedia.upsert({
      where: { id: media.id },
      create: {
        id: media.id,
        ...data,
      },
      update: data,
    });

    return this.mapMediaToEntity(saved);
  }

  async deleteQuestionMedia(id: string): Promise<void> {
    await this.prisma.questionMedia.delete({
      where: { id },
    });
  }

  // ============================================
  // ANSWERS, QUESTIONS, CHOICES, VIOLATIONS
  // ============================================

  async findAnswersBySessionId(sessionId: string): Promise<SessionAnswerEntity[]> {
    const answers = await this.prisma.sessionAnswer.findMany({
      where: { sessionId },
    });
    return answers.map((a) => this.mapAnswerToEntity(a));
  }

  async findQuestionsByExamId(examId: string): Promise<ExamQuestionEntity[]> {
    const eq = await this.prisma.examQuestion.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });
    return eq.map((item) => this.mapExamQuestionToEntity(item));
  }

  async findExamQuestionsByQuestionId(questionId: string): Promise<ExamQuestionEntity[]> {
    const eq = await this.prisma.examQuestion.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });
    return eq.map((item) => this.mapExamQuestionToEntity(item));
  }

  async findChoicesByQuestionId(questionId: string): Promise<QuestionChoiceEntity[]> {
    const choices = await this.prisma.questionChoice.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });
    return choices.map((c) => this.mapChoiceToEntity(c));
  }

  async saveSessionAnswer(answer: SessionAnswerEntity): Promise<SessionAnswerEntity> {
    const data = {
      sessionId: answer.getSessionId(),
      questionId: answer.getQuestionId(),
      answerText: answer.getAnswerText(),
      choiceIds: answer.getChoiceIds(),
      isCorrect: answer.getIsCorrect(),
      points: answer.getPoints(),
      createdBy: answer.getCreatedBy(),
      updatedBy: answer.getUpdatedBy(),
      version: answer.version + BigInt(1),
    };

    const saved = await this.prisma.sessionAnswer.upsert({
      where: { id: answer.id },
      create: {
        id: answer.id,
        ...data,
      },
      update: data,
    });

    return this.mapAnswerToEntity(saved);
  }

  async saveViolation(violation: SessionViolationEntity): Promise<SessionViolationEntity> {
    const data = {
      sessionId: violation.getSessionId(),
      violationType: violation.getViolationType(),
      description: violation.getDescription(),
      occurredAt: violation.getOccurredAt(),
    };

    const saved = await this.prisma.sessionViolation.create({
      data: {
        id: violation.id,
        ...data,
      },
    });

    return this.mapViolationToEntity(saved);
  }

  // ============================================
  // AUTOSAVE SNAPSHOT OPERATIONS
  // ============================================

  async findSnapshotsBySessionId(sessionId: string): Promise<AutosaveSnapshotEntity[]> {
    const snapshots = await this.prisma.autosaveSnapshot.findMany({
      where: { sessionId },
      orderBy: { savedAt: 'desc' },
    });
    return snapshots.map((s) => this.mapSnapshotToEntity(s));
  }

  async saveAutosaveSnapshot(snapshot: AutosaveSnapshotEntity): Promise<AutosaveSnapshotEntity> {
    const data = {
      sessionId: snapshot.getSessionId(),
      snapshotData: snapshot.getSnapshotData() as Prisma.InputJsonValue,
      savedAt: snapshot.getSavedAt(),
    };

    const saved = await this.prisma.autosaveSnapshot.create({
      data: {
        id: snapshot.id,
        ...data,
      },
    });

    return this.mapSnapshotToEntity(saved);
  }

  // ============================================
  // SKILL RESULT OPERATIONS
  // ============================================

  async findSkillResultsByResultId(resultId: string): Promise<SkillResultEntity[]> {
    const skills = await this.prisma.skillResult.findMany({
      where: { resultId },
    });
    return skills.map((s) => this.mapSkillResultToEntity(s));
  }

  async saveSkillResult(skillResult: SkillResultEntity): Promise<SkillResultEntity> {
    const data = {
      resultId: skillResult.getResultId(),
      skillName: skillResult.getSkillName(),
      score: skillResult.getScore(),
      maxScore: skillResult.getMaxScore(),
      accuracyRate: skillResult.getAccuracyRate(),
    };

    const saved = await this.prisma.skillResult.create({
      data: {
        id: skillResult.id,
        ...data,
      },
    });

    return this.mapSkillResultToEntity(saved);
  }

  // ============================================
  // QUESTION RESULT OPERATIONS
  // ============================================

  async findQuestionResultsByResultId(resultId: string): Promise<QuestionResultEntity[]> {
    const qr = await this.prisma.questionResult.findMany({
      where: { resultId },
    });
    return qr.map((q) => this.mapQuestionResultToEntity(q));
  }

  async saveQuestionResult(questionResult: QuestionResultEntity): Promise<QuestionResultEntity> {
    const data = {
      resultId: questionResult.getResultId(),
      questionId: questionResult.getQuestionId(),
      isCorrect: questionResult.getIsCorrect(),
      scoreAwarded: questionResult.getScoreAwarded(),
      timeSpent: questionResult.getTimeSpent(),
    };

    const saved = await this.prisma.questionResult.create({
      data: {
        id: questionResult.id,
        ...data,
      },
    });

    return this.mapQuestionResultToEntity(saved);
  }

  // ============================================
  // AI EVALUATION OPERATIONS
  // ============================================

  async findAiEvaluationByResultId(resultId: string): Promise<AiEvaluationEntity | null> {
    const evaluation = await this.prisma.aiEvaluation.findUnique({
      where: { resultId },
    });
    if (!evaluation) return null;
    return this.mapAiEvaluationToEntity(evaluation);
  }

  async saveAiEvaluation(evaluation: AiEvaluationEntity): Promise<AiEvaluationEntity> {
    const data = {
      resultId: evaluation.getResultId(),
      evaluationText: evaluation.getEvaluationText(),
      feedbackJson: evaluation.getFeedbackJson() as Prisma.InputJsonValue,
    };

    const saved = await this.prisma.aiEvaluation.create({
      data: {
        id: evaluation.id,
        ...data,
      },
    });

    return this.mapAiEvaluationToEntity(saved);
  }

  // ============================================
  // CREATOR PROFILE OPERATIONS
  // ============================================

  async findCreatorProfileByUserId(userId: string): Promise<CreatorProfileEntity | null> {
    const profile = await this.prisma.creatorProfile.findFirst({
      where: { userId },
    });
    if (!profile) return null;
    return this.mapCreatorProfileToEntity(profile);
  }

  async findCreatorProfileById(id: string): Promise<CreatorProfileEntity | null> {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { id },
    });
    if (!profile) return null;
    return this.mapCreatorProfileToEntity(profile);
  }

  async findCreatorProfiles(limit = 20): Promise<CreatorProfileEntity[]> {
    const profiles = await this.prisma.creatorProfile.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return profiles.map((p) => this.mapCreatorProfileToEntity(p));
  }

  async saveCreatorProfile(profile: CreatorProfileEntity): Promise<CreatorProfileEntity> {
    const data = {
      userId: profile.getUserId(),
      displayName: profile.getDisplayName(),
      bio: profile.getBio(),
      status: profile.getStatus(),
    };

    const saved = await this.prisma.creatorProfile.upsert({
      where: { id: profile.id },
      create: {
        id: profile.id,
        ...data,
      },
      update: data,
    });

    return this.mapCreatorProfileToEntity(saved);
  }

  // ============================================
  // COLLECTION FAVORITE OPERATIONS
  // ============================================

  async findFavoritesByUserId(userId: string) {
    return this.prisma.collectionFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFavoritesWithCollectionsByUserId(userId: string) {
    const favorites = await this.prisma.collectionFavorite.findMany({
      where: { userId },
      include: {
        collection: {
          select: {
            id: true,
            title: true,
            description: true,
            ownerId: true,
            publishStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const collectionIds = favorites
      .filter((f): f is typeof f & { collection: NonNullable<typeof f.collection> } => f.collection !== null)
      .map(f => f.collection.id);

    const exams = collectionIds.length > 0
      ? await this.prisma.exam.findMany({
          where: { collectionId: { in: collectionIds }, deletedAt: null },
          select: { id: true, collectionId: true, title: true, duration: true, totalQuestions: true },
        })
      : [];

    const examsByCollection = new Map<string, typeof exams>();
    for (const exam of exams) {
      const list = examsByCollection.get(exam.collectionId) || [];
      list.push(exam);
      examsByCollection.set(exam.collectionId, list);
    }

    return favorites.map(f => ({
      ...f,
      collection: f.collection,
      exams: f.collection ? (examsByCollection.get(f.collection.id) || []).map(e => ({
        id: e.id,
        title: e.title,
        duration: e.duration,
        totalQuestions: e.totalQuestions,
      })) : [],
    }));
  }

  async findFavoriteById(id: string) {
    return this.prisma.collectionFavorite.findUnique({ where: { id } });
  }

  async findFavoriteByUserAndCollection(userId: string, collectionId: string) {
    return this.prisma.collectionFavorite.findUnique({
      where: {
        collectionId_userId: { collectionId, userId },
      },
    });
  }

  async saveFavorite(favorite: { userId: string; collectionId: string }) {
    return this.prisma.collectionFavorite.upsert({
      where: {
        collectionId_userId: {
          collectionId: favorite.collectionId,
          userId: favorite.userId,
        },
      },
      create: {
        collectionId: favorite.collectionId,
        userId: favorite.userId,
      },
      update: {},
    });
  }

  async deleteFavorite(userId: string, collectionId: string): Promise<void> {
    await this.prisma.collectionFavorite.delete({
      where: {
        collectionId_userId: { collectionId, userId },
      },
    });
  }

  // ============================================
  // COLLECTION BOOKMARK OPERATIONS
  // ============================================

  async findBookmarksByUserId(userId: string) {
    return this.prisma.collectionBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBookmarksWithDetailsByUserId(userId: string) {
    const bookmarks = await this.prisma.collectionBookmark.findMany({
      where: { userId },
      include: {
        collection: {
          select: {
            id: true,
            title: true,
            description: true,
            ownerId: true,
            publishStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const collectionIds = bookmarks
      .filter((b): b is typeof b & { collection: NonNullable<typeof b.collection> } => b.collection !== null)
      .map(b => b.collection.id);

    const exams = collectionIds.length > 0
      ? await this.prisma.exam.findMany({
          where: { collectionId: { in: collectionIds }, deletedAt: null },
          select: { id: true, collectionId: true, title: true, duration: true, totalQuestions: true },
        })
      : [];

    const examsByCollection = new Map<string, typeof exams>();
    for (const exam of exams) {
      const list = examsByCollection.get(exam.collectionId) || [];
      list.push(exam);
      examsByCollection.set(exam.collectionId, list);
    }

    return bookmarks.map(b => ({
      ...b,
      collection: b.collection,
      exams: b.collection ? (examsByCollection.get(b.collection.id) || []).map(e => ({
        id: e.id,
        title: e.title,
        duration: e.duration,
        totalQuestions: e.totalQuestions,
      })) : [],
    }));
  }

  async findBookmarkById(id: string) {
    return this.prisma.collectionBookmark.findUnique({ where: { id } });
  }

  async findBookmarksWithCollectionsByUserId(userId: string) {
    const bookmarks = await this.prisma.collectionBookmark.findMany({
      where: { userId },
      include: {
        collection: {
          select: {
            id: true,
            title: true,
            description: true,
            ownerId: true,
            publishStatus: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const collectionIds = bookmarks
      .filter((b): b is typeof b & { collection: NonNullable<typeof b.collection> } => b.collection !== null)
      .map(b => b.collection.id);
    const examCounts = await this.prisma.exam.groupBy({
      by: ['collectionId'],
      where: { collectionId: { in: collectionIds }, deletedAt: null },
      _count: { id: true },
    });
    const examCountMap = new Map(examCounts.map(e => [e.collectionId, e._count.id]));

    const itemCounts = await this.prisma.collectionItem.groupBy({
      by: ['collectionId'],
      where: { collectionId: { in: collectionIds } },
      _count: { id: true },
    });
    const itemCountMap = new Map(itemCounts.map(i => [i.collectionId, i._count.id]));

    return bookmarks.map(b => ({
      id: b.id,
      collectionId: b.collectionId,
      userId: b.userId,
      createdAt: b.createdAt,
      collection: b.collection ? {
        ...b.collection,
        examCount: examCountMap.get(b.collection.id) ?? 0,
        itemCount: itemCountMap.get(b.collection.id) ?? 0,
      } : null,
    }));
  }

  async findBookmarkByUserAndCollection(userId: string, collectionId: string) {
    return this.prisma.collectionBookmark.findUnique({
      where: {
        collectionId_userId: { collectionId, userId },
      },
    });
  }

  async saveBookmark(bookmark: { userId: string; collectionId: string }) {
    return this.prisma.collectionBookmark.upsert({
      where: {
        collectionId_userId: {
          collectionId: bookmark.collectionId,
          userId: bookmark.userId,
        },
      },
      create: {
        collectionId: bookmark.collectionId,
        userId: bookmark.userId,
      },
      update: {},
    });
  }

  async deleteBookmark(userId: string, collectionId: string): Promise<void> {
    await this.prisma.collectionBookmark.delete({
      where: {
        collectionId_userId: { collectionId, userId },
      },
    });
  }

  // ============================================
  // USER DOWNLOAD OPERATIONS
  // ============================================

  async findDownloadsByUserId(userId: string): Promise<UserDownload[]> {
    return this.prisma.userDownload.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveDownload(download: {
    userId: string;
    itemType: string;
    itemId: string;
    fileName: string;
    fileSize: number;
    downloadUrl?: string;
  }): Promise<UserDownload> {
    return this.prisma.userDownload.create({
      data: {
        userId: download.userId,
        itemType: download.itemType,
        itemId: download.itemId,
        fileName: download.fileName,
        fileSize: download.fileSize,
        downloadUrl: download.downloadUrl,
      },
    });
  }

  async deleteDownload(id: string): Promise<void> {
    await this.prisma.userDownload.delete({
      where: { id },
    });
  }

  async deleteAllDownloads(userId: string): Promise<void> {
    await this.prisma.userDownload.deleteMany({
      where: { userId },
    });
  }

  // ============================================
  // COLLECTION PURCHASE OPERATIONS
  // ============================================

  async findPurchasesByUserId(userId: string): Promise<CollectionPurchase[]> {
    return this.prisma.collectionPurchase.findMany({
      where: { userId },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  async findPurchaseByUserAndCollection(
    userId: string,
    collectionId: string
  ): Promise<CollectionPurchase | null> {
    return this.prisma.collectionPurchase.findUnique({
      where: {
        userId_collectionId: { userId, collectionId },
      },
    });
  }

  async savePurchase(purchase: {
    userId: string;
    collectionId: string;
    amount?: number;
    currency?: string;
  }): Promise<CollectionPurchase> {
    return this.prisma.collectionPurchase.upsert({
      where: {
        userId_collectionId: {
          userId: purchase.userId,
          collectionId: purchase.collectionId,
        },
      },
      create: {
        userId: purchase.userId,
        collectionId: purchase.collectionId,
        amount: purchase.amount,
        currency: purchase.currency,
      },
      update: {
        amount: purchase.amount,
        currency: purchase.currency,
      },
    });
  }

  // ============================================
  // COLLECTION REPORT OPERATIONS
  // ============================================

  async saveReport(report: {
    collectionId: string;
    userId: string;
    reason?: string;
  }): Promise<CollectionReport> {
    return this.prisma.collectionReport.create({
      data: {
        collectionId: report.collectionId,
        userId: report.userId,
        reason: report.reason,
      },
    });
  }

  // ============================================
  // PRIVATE MAPPER FUNCTIONS
  // ============================================

  private mapCollectionToEntity(
    dbObj: Collection & { items?: CollectionItem[]; exams?: Exam[] }
  ): CollectionEntity {
    return CollectionEntity.create({
      id: dbObj.id,
      title: dbObj.title,
      description: dbObj.description ?? undefined,
      ownerId: dbObj.ownerId,
      publishStatus: dbObj.publishStatus,
      itemCount: dbObj.items?.length ?? 0,
      examCount: dbObj.exams?.length ?? 0,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
      deletedAt: dbObj.deletedAt ?? undefined,
      version: dbObj.version,
    });
  }

  private mapExamToEntity(dbObj: Exam): ExamEntity {
    return ExamEntity.create({
      id: dbObj.id,
      title: dbObj.title,
      description: dbObj.description ?? undefined,
      duration: dbObj.duration,
      totalQuestions: dbObj.totalQuestions,
      maxScore: dbObj.maxScore,
      passScore: dbObj.passScore,
      publishStatus: dbObj.publishStatus,
      collectionId: dbObj.collectionId,
      chapterId: dbObj.chapterId ?? undefined,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
      deletedAt: dbObj.deletedAt ?? undefined,
      version: dbObj.version,
    });
  }

  private mapChapterToEntity(dbObj: Chapter): ChapterEntity {
    return ChapterEntity.create({
      id: dbObj.id,
      collectionId: dbObj.collectionId,
      title: dbObj.title,
      description: dbObj.description ?? undefined,
      order: dbObj.order,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
      deletedAt: dbObj.deletedAt ?? undefined,
      version: BigInt(1),
    });
  }

  private mapSectionToEntity(dbObj: ExamSection): ExamSectionEntity {
    return ExamSectionEntity.create({
      id: dbObj.id,
      examId: dbObj.examId,
      title: dbObj.title,
      instruction: dbObj.instruction ?? undefined,
      order: dbObj.order,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }

  private mapRuleToEntity(dbObj: ExamRule): ExamRuleEntity {
    return ExamRuleEntity.create({
      id: dbObj.id,
      examId: dbObj.examId,
      ruleType: dbObj.ruleType,
      ruleValue: dbObj.ruleValue,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }

  private mapSessionToEntity(dbObj: ExamSession): ExamSessionEntity {
    return ExamSessionEntity.create({
      id: dbObj.id,
      examId: dbObj.examId,
      userId: dbObj.userId,
      status: dbObj.status,
      startedAt: dbObj.startedAt,
      endedAt: dbObj.endedAt ?? undefined,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
      version: dbObj.version,
    });
  }

  private mapResultToEntity(dbObj: ExamResult): ExamResultEntity {
    return ExamResultEntity.create({
      id: dbObj.id,
      sessionId: dbObj.sessionId,
      examId: dbObj.examId,
      userId: dbObj.userId,
      totalScore: dbObj.totalScore,
      passed: dbObj.passed,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }

  private mapQuestionToEntity(dbObj: Question): QuestionEntity {
    return QuestionEntity.create({
      id: dbObj.id,
      title: dbObj.title,
      content: dbObj.content,
      type: dbObj.type,
      difficulty: dbObj.difficulty,
      status: dbObj.status,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
      deletedAt: dbObj.deletedAt ?? undefined,
      version: dbObj.version,
    });
  }

  private mapHintToEntity(dbObj: QuestionHint): QuestionHintEntity {
    return QuestionHintEntity.create({
      id: dbObj.id,
      questionId: dbObj.questionId,
      content: dbObj.content,
      order: dbObj.order,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }

  private mapMediaToEntity(dbObj: QuestionMedia): QuestionMediaEntity {
    return QuestionMediaEntity.create({
      id: dbObj.id,
      questionId: dbObj.questionId,
      mediaUrl: dbObj.mediaUrl,
      mediaType: dbObj.mediaType,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }

  private mapAnswerToEntity(dbObj: SessionAnswer): SessionAnswerEntity {
    return SessionAnswerEntity.create({
      id: dbObj.id,
      sessionId: dbObj.sessionId,
      questionId: dbObj.questionId,
      answerText: dbObj.answerText,
      choiceIds: dbObj.choiceIds,
      isCorrect: dbObj.isCorrect,
      points: dbObj.points,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }

  private mapExamQuestionToEntity(dbObj: ExamQuestion): ExamQuestionEntity {
    return ExamQuestionEntity.create({
      id: dbObj.id,
      examId: dbObj.examId,
      questionId: dbObj.questionId,
      order: dbObj.order,
      points: dbObj.points,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }

  private mapChoiceToEntity(dbObj: QuestionChoice): QuestionChoiceEntity {
    return QuestionChoiceEntity.create({
      id: dbObj.id,
      questionId: dbObj.questionId,
      content: dbObj.content,
      isCorrect: dbObj.isCorrect,
      order: dbObj.order,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }

  private mapMetadataToEntity(dbObj: {
    id: string;
    questionId: string;
    explanation: string | null;
    points: number;
    estimatedTime: string | null;
    shuffleOptions: boolean;
    referenceType: string | null;
    passageSource: string | null;
    highlight: string | null;
    cognitiveLevel: string | null;
    tags: string[];
    skills: string[];
    qualityScore: number | null;
    qualityRating: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): QuestionMetadataEntity {
    return QuestionMetadataEntity.fromPersistence({
      id: dbObj.id,
      questionId: dbObj.questionId,
      explanation: dbObj.explanation,
      points: dbObj.points,
      estimatedTime: dbObj.estimatedTime,
      shuffleOptions: dbObj.shuffleOptions,
      referenceType: dbObj.referenceType,
      passageSource: dbObj.passageSource,
      highlight: dbObj.highlight,
      cognitiveLevel: dbObj.cognitiveLevel,
      tags: dbObj.tags,
      skills: dbObj.skills,
      qualityScore: dbObj.qualityScore,
      qualityRating: dbObj.qualityRating,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }

  private mapViolationToEntity(dbObj: SessionViolation): SessionViolationEntity {
    return SessionViolationEntity.create({
      id: dbObj.id,
      sessionId: dbObj.sessionId,
      violationType: dbObj.violationType,
      description: dbObj.description,
      occurredAt: dbObj.occurredAt,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.createdAt,
    });
  }

  private mapSnapshotToEntity(dbObj: AutosaveSnapshot): AutosaveSnapshotEntity {
    return AutosaveSnapshotEntity.create({
      id: dbObj.id,
      sessionId: dbObj.sessionId,
      snapshotData: dbObj.snapshotData as Prisma.JsonValue,
      savedAt: dbObj.savedAt,
    });
  }

  private mapSkillResultToEntity(dbObj: SkillResult): SkillResultEntity {
    return SkillResultEntity.create({
      id: dbObj.id,
      resultId: dbObj.resultId,
      skillName: dbObj.skillName,
      score: dbObj.score,
      maxScore: dbObj.maxScore,
      accuracyRate: dbObj.accuracyRate,
      createdAt: dbObj.createdAt,
    });
  }

  private mapQuestionResultToEntity(dbObj: QuestionResult): QuestionResultEntity {
    return QuestionResultEntity.create({
      id: dbObj.id,
      resultId: dbObj.resultId,
      questionId: dbObj.questionId,
      isCorrect: dbObj.isCorrect,
      scoreAwarded: dbObj.scoreAwarded,
      timeSpent: dbObj.timeSpent,
      createdAt: dbObj.createdAt,
    });
  }

  private mapAiEvaluationToEntity(dbObj: AiEvaluation): AiEvaluationEntity {
    return AiEvaluationEntity.create({
      id: dbObj.id,
      resultId: dbObj.resultId,
      evaluationText: dbObj.evaluationText,
      feedbackJson: dbObj.feedbackJson as Prisma.JsonValue,
      createdAt: dbObj.createdAt,
    });
  }

  // ===================== CollectionReview =====================

  async findReviewsByCollectionId(collectionId: string) {
    return this.prisma.collectionReview.findMany({
      where: { collectionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findReviewsByCollectionIdWithUser(collectionId: string) {
    return this.prisma.collectionReview.findMany({
      where: { collectionId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, picture: true },
        },
      },
    });
  }

  async findReviewById(id: string) {
    return this.prisma.collectionReview.findUnique({ where: { id } });
  }

  async findReviewByUserAndCollection(userId: string, collectionId: string) {
    return this.prisma.collectionReview.findFirst({
      where: { userId, collectionId },
    });
  }

  async saveReview(data: { collectionId: string; userId: string; rating: number; text: string }) {
    const existing = await this.findReviewByUserAndCollection(data.userId, data.collectionId);
    if (existing) {
      return this.prisma.collectionReview.update({
        where: { id: existing.id },
        data: { rating: data.rating, text: data.text },
      });
    }
    return this.prisma.collectionReview.create({ data });
  }

  async saveReviewWithUser(data: { collectionId: string; userId: string; rating: number; text: string }) {
    const existing = await this.findReviewByUserAndCollection(data.userId, data.collectionId);
    if (existing) {
      return this.prisma.collectionReview.update({
        where: { id: existing.id },
        data: { rating: data.rating, text: data.text },
        include: { user: { select: { name: true, email: true, picture: true } } },
      });
    }
    return this.prisma.collectionReview.create({
      data,
      include: { user: { select: { name: true, email: true, picture: true } } },
    });
  }

  async deleteReview(id: string) {
    await this.prisma.collectionReview.delete({ where: { id } });
  }

  // ===================== CollectionDiscussion =====================

  async findDiscussionsByCollectionId(collectionId: string) {
    return this.prisma.collectionDiscussion.findMany({
      where: { collectionId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { replies: true } } },
    });
  }

  async findDiscussionById(id: string) {
    return this.prisma.collectionDiscussion.findUnique({
      where: { id },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async saveDiscussion(data: { collectionId: string; userId: string; title: string; content: string }) {
    return this.prisma.collectionDiscussion.create({ data });
  }

  async deleteDiscussion(id: string) {
    await this.prisma.collectionDiscussion.delete({ where: { id } });
  }

  // ===================== DiscussionReply =====================

  async findRepliesByDiscussionId(discussionId: string) {
    return this.prisma.discussionReply.findMany({
      where: { discussionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async saveReply(data: { discussionId: string; userId: string; content: string }) {
    return this.prisma.discussionReply.create({ data });
  }

  async deleteReply(id: string) {
    await this.prisma.discussionReply.delete({ where: { id } });
  }

  private mapCreatorProfileToEntity(dbObj: CreatorProfile): CreatorProfileEntity {
    return CreatorProfileEntity.create({
      id: dbObj.id,
      userId: dbObj.userId,
      displayName: dbObj.displayName,
      bio: dbObj.bio,
      status: dbObj.status,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
    });
  }
}
