import { Injectable } from '@nestjs/common';
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
  PagePagination,
  QueryParams,
} from '@spark-nest-ed/shared-libs';

@Injectable()
export class CertificationRepository implements ICertificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // COLLECTION OPERATIONS
  // ============================================

  async findCollections(queryParams?: QueryParams) {
    const normalizedParams = normalizeQueryParams(queryParams || {}) as Record<string, unknown>;
    const prismaQuery = buildPrismaQuery(normalizedParams, {
      maxLimit: 100,
      defaultLimit: 20,
    });

    const where: Prisma.CollectionWhereInput = {
      publishStatus: 'published',
      deletedAt: null,
      ...prismaQuery.where,
    };

    if (normalizedParams.q || normalizedParams.search) {
      const searchTerm = (normalizedParams.q || normalizedParams.search) as string;
      where['title'] = { contains: searchTerm, mode: 'insensitive' };
    }

    const orderBy = prismaQuery.orderBy && Object.keys(prismaQuery.orderBy).length > 0
      ? prismaQuery.orderBy
      : [{ createdAt: 'desc' }];

    const pagination = extractPagination(normalizedParams);
    let page = 1;
    let limit = 20;

    if (pagination && 'page' in pagination) {
      const pagePagination = pagination as PagePagination;
      page = pagePagination.page;
      limit = pagePagination.pageSize;
    }

    const total = await this.prisma.collection.count({ where });
    const items = await this.prisma.collection.findMany({
      where,
      include: {
        items: true,
        exams: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map(item => this.mapCollectionToEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findCollectionById(id: string): Promise<CollectionEntity | null> {
    const col = await this.prisma.collection.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: true,
        exams: true,
      },
    });
    if (!col) return null;
    return this.mapCollectionToEntity(col);
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
    const normalizedParams = normalizeQueryParams(queryParams || {}) as Record<string, unknown>;
    const prismaQuery = buildPrismaQuery(normalizedParams, {
      maxLimit: 100,
      defaultLimit: 20,
    });

    const where: Prisma.ExamWhereInput = {
      publishStatus: 'published',
      deletedAt: null,
      ...prismaQuery.where,
    };

    if (normalizedParams.q || normalizedParams.search) {
      const searchTerm = (normalizedParams.q || normalizedParams.search) as string;
      where['title'] = { contains: searchTerm, mode: 'insensitive' };
    }

    const orderBy = prismaQuery.orderBy && Object.keys(prismaQuery.orderBy).length > 0
      ? prismaQuery.orderBy
      : [{ createdAt: 'desc' }];

    const pagination = extractPagination(normalizedParams);
    let page = 1;
    let limit = 20;

    if (pagination && 'page' in pagination) {
      const pagePagination = pagination as PagePagination;
      page = pagePagination.page;
      limit = pagePagination.pageSize;
    }

    const total = await this.prisma.exam.count({ where });
    const items = await this.prisma.exam.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map(item => this.mapExamToEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findExamById(id: string): Promise<ExamEntity | null> {
    const exam = await this.prisma.exam.findFirst({
      where: { id, deletedAt: null },
    });
    if (!exam) return null;
    return this.mapExamToEntity(exam);
  }

  async findExamsByCollectionId(collectionId: string): Promise<ExamEntity[]> {
    const exams = await this.prisma.exam.findMany({
      where: { collectionId, deletedAt: null, publishStatus: 'published' },
    });
    return exams.map((exam) => this.mapExamToEntity(exam));
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
    const records = await this.prisma.examSection.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });
    return records.map(r => this.mapSectionToEntity(r));
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
    await this.prisma.examSection.delete({
      where: { id },
    });
  }

  // ============================================
  // EXAM RULE OPERATIONS
  // ============================================

  async findRulesByExamId(examId: string): Promise<ExamRuleEntity[]> {
    const records = await this.prisma.examRule.findMany({
      where: { examId },
    });
    return records.map(r => this.mapRuleToEntity(r));
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
    });
    if (!session) return null;
    return this.mapSessionToEntity(session);
  }

  async saveSession(session: ExamSessionEntity): Promise<ExamSessionEntity> {
    const data = {
      examId: session.getExamId(),
      userId: session.getUserId(),
      startedAt: session.getStartedAt(),
      endedAt: session.getEndedAt(),
      status: session.getStatus(),
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
    return sessions.map(s => this.mapSessionToEntity(s));
  }

  // ============================================
  // EXAM RESULT OPERATIONS
  // ============================================

  async findResultById(id: string): Promise<ExamResultEntity | null> {
    const result = await this.prisma.examResult.findUnique({
      where: { id },
    });
    if (!result) return null;
    return this.mapResultToEntity(result);
  }

  async findResultBySessionId(sessionId: string): Promise<ExamResultEntity | null> {
    const result = await this.prisma.examResult.findFirst({
      where: { sessionId },
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
    return results.map(r => this.mapResultToEntity(r));
  }

  // ============================================
  // QUESTION OPERATIONS
  // ============================================

  async findQuestionById(id: string): Promise<QuestionEntity | null> {
    const record = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) return null;
    return this.mapQuestionToEntity(record);
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
      version: question.version + BigInt(1),
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
    const records = await this.prisma.questionHint.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });
    return records.map(r => this.mapHintToEntity(r));
  }

  async saveQuestionHint(hint: QuestionHintEntity): Promise<QuestionHintEntity> {
    const data = {
      questionId: hint.getQuestionId(),
      content: hint.getContent(),
      order: hint.getOrder(),
      createdBy: hint.getCreatedBy(),
      updatedBy: hint.getUpdatedBy(),
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
    const records = await this.prisma.questionMedia.findMany({
      where: { questionId },
    });
    return records.map(r => this.mapMediaToEntity(r));
  }

  async saveQuestionMedia(media: QuestionMediaEntity): Promise<QuestionMediaEntity> {
    const data = {
      questionId: media.getQuestionId(),
      mediaUrl: media.getMediaUrl(),
      mediaType: media.getMediaType(),
      createdBy: media.getCreatedBy(),
      updatedBy: media.getUpdatedBy(),
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
    const records = await this.prisma.sessionAnswer.findMany({
      where: { sessionId },
    });
    return records.map(r => this.mapAnswerToEntity(r));
  }

  async findQuestionsByExamId(examId: string): Promise<ExamQuestionEntity[]> {
    const records = await this.prisma.examQuestion.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });
    return records.map(r => this.mapExamQuestionToEntity(r));
  }

  async findChoicesByQuestionId(questionId: string): Promise<QuestionChoiceEntity[]> {
    const records = await this.prisma.questionChoice.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });
    return records.map(r => this.mapChoiceToEntity(r));
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

    const saved = await this.prisma.sessionViolation.upsert({
      where: { id: violation.id },
      create: {
        id: violation.id,
        ...data,
      },
      update: data,
    });

    return this.mapViolationToEntity(saved);
  }

  // ============================================
  // AUTOSAVE SNAPSHOT OPERATIONS
  // ============================================

  async findSnapshotsBySessionId(sessionId: string): Promise<AutosaveSnapshotEntity[]> {
    const records = await this.prisma.autosaveSnapshot.findMany({
      where: { sessionId },
      orderBy: { savedAt: 'desc' },
    });
    return records.map(r => this.mapSnapshotToEntity(r));
  }

  async saveAutosaveSnapshot(snapshot: AutosaveSnapshotEntity): Promise<AutosaveSnapshotEntity> {
    const data = {
      sessionId: snapshot.getSessionId(),
      snapshotData: snapshot.getSnapshotData() as Prisma.InputJsonValue,
      savedAt: snapshot.getSavedAt(),
    };

    const saved = await this.prisma.autosaveSnapshot.upsert({
      where: { id: snapshot.id },
      create: {
        id: snapshot.id,
        ...data,
      },
      update: data,
    });

    return this.mapSnapshotToEntity(saved);
  }

  // ============================================
  // SKILL RESULT OPERATIONS
  // ============================================

  async findSkillResultsByResultId(resultId: string): Promise<SkillResultEntity[]> {
    const records = await this.prisma.skillResult.findMany({
      where: { resultId },
    });
    return records.map(r => this.mapSkillResultToEntity(r));
  }

  async saveSkillResult(skillResult: SkillResultEntity): Promise<SkillResultEntity> {
    const data = {
      resultId: skillResult.getResultId(),
      skillName: skillResult.getSkillName(),
      score: skillResult.getScore(),
      maxScore: skillResult.getMaxScore(),
      accuracyRate: skillResult.getAccuracyRate(),
    };

    const saved = await this.prisma.skillResult.upsert({
      where: { id: skillResult.id },
      create: {
        id: skillResult.id,
        ...data,
      },
      update: data,
    });

    return this.mapSkillResultToEntity(saved);
  }

  // ============================================
  // QUESTION RESULT OPERATIONS
  // ============================================

  async findQuestionResultsByResultId(resultId: string): Promise<QuestionResultEntity[]> {
    const records = await this.prisma.questionResult.findMany({
      where: { resultId },
    });
    return records.map(r => this.mapQuestionResultToEntity(r));
  }

  async saveQuestionResult(questionResult: QuestionResultEntity): Promise<QuestionResultEntity> {
    const data = {
      resultId: questionResult.getResultId(),
      questionId: questionResult.getQuestionId(),
      isCorrect: questionResult.getIsCorrect(),
      scoreAwarded: questionResult.getScoreAwarded(),
      timeSpent: questionResult.getTimeSpent(),
    };

    const saved = await this.prisma.questionResult.upsert({
      where: { id: questionResult.id },
      create: {
        id: questionResult.id,
        ...data,
      },
      update: data,
    });

    return this.mapQuestionResultToEntity(saved);
  }

  // ============================================
  // AI EVALUATION OPERATIONS
  // ============================================

  async findAiEvaluationByResultId(resultId: string): Promise<AiEvaluationEntity | null> {
    const record = await this.prisma.aiEvaluation.findUnique({
      where: { resultId },
    });
    if (!record) return null;
    return this.mapAiEvaluationToEntity(record);
  }

  async saveAiEvaluation(evaluation: AiEvaluationEntity): Promise<AiEvaluationEntity> {
    const data = {
      resultId: evaluation.getResultId(),
      evaluationText: evaluation.getEvaluationText(),
      feedbackJson: evaluation.getFeedbackJson() as Prisma.InputJsonValue,
    };

    const saved = await this.prisma.aiEvaluation.upsert({
      where: { id: evaluation.id },
      create: {
        id: evaluation.id,
        ...data,
      },
      update: data,
    });

    return this.mapAiEvaluationToEntity(saved);
  }

  // ============================================
  // CREATOR PROFILE OPERATIONS
  // ============================================

  async findCreatorProfileById(id: string): Promise<CreatorProfileEntity | null> {
    const record = await this.prisma.creatorProfile.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.mapCreatorProfileToEntity(record);
  }

  async findCreatorProfiles(limit = 10): Promise<CreatorProfileEntity[]> {
    const records = await this.prisma.creatorProfile.findMany({
      take: limit,
    });
    return records.map((r) => this.mapCreatorProfileToEntity(r));
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
  // MAPPER FUNCTIONS
  // ============================================

  private mapCollectionToEntity(dbObj: Collection & { exams?: Exam[]; items?: CollectionItem[] }): CollectionEntity {
    return CollectionEntity.create({
      id: dbObj.id,
      title: dbObj.title,
      description: dbObj.description,
      ownerId: dbObj.ownerId,
      publishStatus: dbObj.publishStatus,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      deletedAt: dbObj.deletedAt,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
      version: dbObj.version,
      examCount: dbObj.exams ? dbObj.exams.length : 0,
      itemCount: dbObj.items ? dbObj.items.length : 0,
    });
  }

  private mapExamToEntity(dbObj: Exam): ExamEntity {
    return ExamEntity.create({
      id: dbObj.id,
      title: dbObj.title,
      description: dbObj.description,
      duration: dbObj.duration,
      totalQuestions: dbObj.totalQuestions,
      maxScore: dbObj.maxScore,
      passScore: dbObj.passScore,
      publishStatus: dbObj.publishStatus,
      collectionId: dbObj.collectionId,
      createdBy: dbObj.createdBy,
      updatedBy: dbObj.updatedBy,
      deletedAt: dbObj.deletedAt,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
      version: dbObj.version,
    });
  }

  private mapSectionToEntity(dbObj: ExamSection): ExamSectionEntity {
    return ExamSectionEntity.create({
      id: dbObj.id,
      examId: dbObj.examId,
      title: dbObj.title,
      instruction: dbObj.instruction,
      order: dbObj.order,
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
      startedAt: dbObj.startedAt,
      endedAt: dbObj.endedAt,
      status: dbObj.status,
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
      version: BigInt(1),
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
      deletedAt: dbObj.deletedAt,
      createdAt: dbObj.createdAt,
      updatedAt: dbObj.updatedAt,
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
