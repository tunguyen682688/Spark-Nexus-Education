import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import {
  Collection,
  CollectionItem,
  Exam,
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
  Prisma,
} from '@prisma/client';
import { CollectionEntity } from '../../domain/entities/collection.entity';
import { ExamEntity } from '../../domain/entities/exam.entity';
import { ExamSessionEntity } from '../../domain/entities/exam-session.entity';
import { ExamResultEntity } from '../../domain/entities/exam-result.entity';
import { ExamQuestionEntity } from '../../domain/entities/exam-question.entity';
import { QuestionChoiceEntity } from '../../domain/entities/question-choice.entity';
import { SessionAnswerEntity } from '../../domain/entities/session-answer.entity';
import { SessionViolationEntity } from '../../domain/entities/session-violation.entity';
import { ExamSectionEntity } from '../../domain/entities/exam-section.entity';
import { ExamRuleEntity } from '../../domain/entities/exam-rule.entity';
import { QuestionEntity } from '../../domain/entities/question.entity';
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

  async deleteCollection(id: string): Promise<void> {
    await this.prisma.collection.update({
      where: { id },
      data: { deletedAt: new Date() },
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
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
      deletedAt: dbObj.deletedAt ?? undefined,
      version: dbObj.version,
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
