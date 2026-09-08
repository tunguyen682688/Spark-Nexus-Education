import { CollectionEntity } from '../entities/collection.entity';
import { ExamEntity } from '../entities/exam.entity';
import { ChapterEntity } from '../entities/chapter.entity';
import { ExamSessionEntity } from '../entities/exam-session.entity';
import { ExamResultEntity } from '../entities/exam-result.entity';
import { ExamQuestionEntity } from '../entities/exam-question.entity';
import { QuestionChoiceEntity } from '../entities/question-choice.entity';
import { SessionAnswerEntity } from '../entities/session-answer.entity';
import { SessionViolationEntity } from '../entities/session-violation.entity';
import { ExamSectionEntity } from '../entities/exam-section.entity';
import { QuestionEntity } from '../entities/question.entity';
import { QuestionMetadataEntity } from '../entities/question-metadata.entity';
import { SkillResultEntity } from '../entities/skill-result.entity';
import { QuestionResultEntity } from '../entities/question-result.entity';
import { AiEvaluationEntity } from '../entities/ai-evaluation.entity';
import { CreatorProfileEntity } from '../entities/creator-profile.entity';
import { QueryParams } from '@spark-nest-ed/shared-libs';
import {
  UserDownload,
  CollectionPurchase,
  CollectionReport,
  CollectionFavorite,
  CollectionBookmark,
  CollectionReview,
  CollectionDiscussion,
  DiscussionReply,
} from '../types/certification-domain.types';

export const CERTIFICATION_REPOSITORY = Symbol('CERTIFICATION_REPOSITORY');

export interface ICertificationRepository {
  // Collection Operations
  findCollections(queryParams?: QueryParams): Promise<{
    items: CollectionEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  findCollectionById(id: string): Promise<CollectionEntity | null>;
  saveCollection(collection: CollectionEntity): Promise<CollectionEntity>;
  cloneCollection(sourceCollectionId: string, newOwnerId: string): Promise<CollectionEntity>;
  deleteCollection(id: string): Promise<void>;
  findActivitiesByCollectionId(
    collectionId: string,
    limit?: number
  ): Promise<Array<{ user: string; action: string; time: string }>>;

  // Exam Operations
  findExams(queryParams?: QueryParams): Promise<{
    items: ExamEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  findExamById(id: string): Promise<ExamEntity | null>;
  findExamsByCollectionId(collectionId: string): Promise<ExamEntity[]>;
  findExamsByChapterId(chapterId: string): Promise<ExamEntity[]>;
  saveExam(exam: ExamEntity): Promise<ExamEntity>;
  deleteExam(id: string): Promise<void>;
  updateExamChapterId(examId: string, chapterId: string | null): Promise<void>;
  updateExamOrder(examId: string, order: number): Promise<void>;
  updateExamInitializationStatus(examId: string, status: string): Promise<void>;

  // Chapter Operations
  findChapterById(id: string): Promise<ChapterEntity | null>;
  findChaptersByCollectionId(collectionId: string): Promise<ChapterEntity[]>;
  saveChapter(chapter: ChapterEntity): Promise<ChapterEntity>;
  deleteChapter(id: string): Promise<void>;

  // Exam Section Operations
  findSectionsByExamId(examId: string): Promise<ExamSectionEntity[]>;
  findSectionById(id: string): Promise<ExamSectionEntity | null>;
  saveExamSection(section: ExamSectionEntity): Promise<ExamSectionEntity>;
  updateSectionMetadata(sectionId: string, data: {
    title?: string;
    subtitle?: string | null;
    instruction?: string | null;
    order?: number;
    durationMinutes?: number;
    questionCount?: number;
  }): Promise<void>;
  deleteExamSection(id: string): Promise<void>;
  deleteAllSectionsByExamId(examId: string): Promise<void>;

  // Exam Session Operations
  findSessionById(id: string): Promise<ExamSessionEntity | null>;
  saveSession(session: ExamSessionEntity): Promise<ExamSessionEntity>;
  findSessionsByUserId(userId: string): Promise<ExamSessionEntity[]>;
  findInProgressSessionsByUserId(userId: string): Promise<Array<{
    id: string;
    examId: string;
    userId: string;
    status: string;
    startedAt: Date;
    endedAt: Date | null;
    exam: { id: string; title: string; collectionId: string; duration: number; totalQuestions: number } | null;
  }>>;

  // Exam Result Operations
  findResultById(id: string): Promise<ExamResultEntity | null>;
  findResultBySessionId(sessionId: string): Promise<ExamResultEntity | null>;
  saveResult(result: ExamResultEntity): Promise<ExamResultEntity>;
  findResultsByUserId(userId: string): Promise<ExamResultEntity[]>;

  // Cloned Collections
  findClonedCollectionsByUserId(userId: string): Promise<Array<{
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    publishStatus: string;
    createdAt: Date;
    examCount: number;
    itemCount: number;
  }>>;

  // My Collections (owned by user)
  findCollectionsByOwnerId(userId: string): Promise<Array<{
    id: string;
    ownerId: string;
    title: string;
    description: string | null;
    publishStatus: string;
    createdAt: Date;
    updatedAt: Date;
    examCount: number;
    itemCount: number;
  }>>;

  // Question Operations
  findQuestionById(id: string): Promise<QuestionEntity | null>;
  findQuestionsByIds(ids: string[]): Promise<QuestionEntity[]>;
  findQuestionVersionsByQuestionId(questionId: string): Promise<Array<{
    id: string;
    questionId: string;
    version: number;
    content: string;
    createdAt: Date;
    createdBy: string | null;
  }>>;
  saveQuestion(question: QuestionEntity): Promise<QuestionEntity>;
  deleteQuestion(id: string): Promise<void>;

  // Question Builder Operations
  findQuestionWithBuilderData(id: string): Promise<{
    question: QuestionEntity;
    choices: QuestionChoiceEntity[];
    metadata: QuestionMetadataEntity | null;
    examQuestions: ExamQuestionEntity[];
  } | null>;
  saveQuestionWithChoices(
    question: QuestionEntity,
    choices: QuestionChoiceEntity[],
    metadata: QuestionMetadataEntity | null
  ): Promise<void>;
  deleteQuestionCascade(id: string): Promise<void>;

  // Transaction Support
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;

  // Batch Question Operations (for PATCH — no version snapshots)
  batchUpsertQuestionsForPatch(params: {
    examId: string;
    userId: string;
    questions: Array<{
      questionId: string;
      questionText: string;
      questionType: string;
      difficulty: string;
      points: number;
      options: Array<{ id?: string; text: string; isCorrect: boolean; label: string }>;
      explanation?: string;
      modelAnswer?: string;
      rubric?: string;
      estimatedTime?: number;
      audioUrl?: string;
      imageUrl?: string;
      passageGroupId?: string;
      passageText?: string;
      passageType?: string;
      passageTitle?: string;
      blankNumber?: number;
      subQuestionNumber?: number;
      formatMetadata?: Record<string, unknown>;
      sectionId: string;
      sectionOrder: number;
      order: number;
      linkId?: string;
    }>;
  }): Promise<number>;

  // Batch Initialize Exam Questions (for async init — single transaction)
  batchInitializeExamQuestions(params: {
    examId: string;
    userId: string;
    questions: Array<{
      question: {
        id: string;
        content: string;
        type: string;
        difficulty: string;
        category: string | null;
        status: string;
        createdBy: string;
        updatedBy: string;
      };
      choices: Array<{
        id: string;
        questionId: string;
        content: string;
        isCorrect: boolean;
        order: number;
        createdBy: string;
        updatedBy: string;
      }>;
      metadata: {
        id: string;
        questionId: string;
        explanation: string | null;
        points: number;
        estimatedTime: string | null;
        shuffleOptions: boolean;
        modelAnswer: string | null;
        rubric: unknown | null;
        passageText: string | null;
        qualityScore: number | null;
      };
      examQuestion: {
        id: string;
        examId: string;
        questionId: string;
        sectionId: string;
        order: number;
        points: number;
        createdBy: string;
        updatedBy: string;
        audioUrl: string | null;
        imageUrl: string | null;
        partNumber: number;
        formatMetadata: unknown | null;
        passageGroupId: string | null;
        passageType: string | null;
        passageTitle: string | null;
        blankNumber: number | null;
        subQuestionNumber: number | null;
      };
    }>;
  }): Promise<number>;

  // Question Metadata Operations
  findMetadataByQuestionId(questionId: string): Promise<QuestionMetadataEntity | null>;
  saveQuestionMetadata(metadata: QuestionMetadataEntity): Promise<QuestionMetadataEntity>;

  // Question Choice Operations
  saveQuestionChoice(choice: QuestionChoiceEntity): Promise<QuestionChoiceEntity>;
  deleteQuestionChoice(id: string): Promise<void>;

  // Answers, Questions, Choices, Violations
  findAnswersBySessionId(sessionId: string): Promise<SessionAnswerEntity[]>;
  findExamQuestionsByExamId(examId: string): Promise<ExamQuestionEntity[]>;
  findExamQuestionsByExamIdAndSectionId(examId: string, sectionId: string): Promise<ExamQuestionEntity[]>;
  deleteExamQuestionsByIds(examId: string, questionIds: string[]): Promise<void>;
  deleteQuestionsByIds(questionIds: string[]): Promise<void>;
  findSectionQuestionsPaginated(params: {
    examId: string;
    sectionId: string;
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{
    questions: Array<{
      examQuestionId: string;
      id: string;
      number: number;
      title: string;
      partTag: string;
      type: string;
      difficulty: string;
      points: number;
      imageUrl: string | null;
      audioUrl: string | null;
      partNumber: number | null;
      // From QuestionMetadata (question-level)
      passageId: string | null;
      passageText: string | null;
      modelAnswer: string | null;
      explanation: string | null;
      estimatedTime: number | null;
      metadataPoints: number | null;
      // From ExamQuestion (per-exam)
      passageGroupId: string | null;
      passageType: string | null;
      passageTitle: string | null;
      blankNumber: number | null;
      subQuestionNumber: number | null;
      formatMetadata: unknown | null;
      // From QuestionChoice table (actual answer options)
      choices: Array<{
        id: string;
        content: string;
        isCorrect: boolean;
        order: number;
      }> | null;
    }>;
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
  findExamQuestionsByQuestionId(questionId: string): Promise<ExamQuestionEntity[]>;
  findExamQuestionByExamAndQuestion(examId: string, questionId: string): Promise<ExamQuestionEntity | null>;
  saveExamQuestion(entity: ExamQuestionEntity): Promise<ExamQuestionEntity>;
  deleteExamQuestion(examId: string, questionId: string): Promise<boolean>;
  deleteAllExamQuestionsByExamId(examId: string): Promise<void>;
  countExamQuestionsByExamId(examId: string): Promise<number>;
  countExamQuestionsBySectionId(examId: string, sectionId: string): Promise<number>;
  batchCountQuestionsBySectionIds(examId: string, sectionIds: string[]): Promise<Map<string, number>>;
  findChoicesByQuestionId(questionId: string): Promise<QuestionChoiceEntity[]>;
  saveSessionAnswer(answer: SessionAnswerEntity): Promise<SessionAnswerEntity>;
  saveViolation(violation: SessionViolationEntity): Promise<SessionViolationEntity>;

  // Skill Result Operations
  findSkillResultsByResultId(resultId: string): Promise<SkillResultEntity[]>;
  saveSkillResult(skillResult: SkillResultEntity): Promise<SkillResultEntity>;

  // Question Result Operations
  findQuestionResultsByResultId(resultId: string): Promise<QuestionResultEntity[]>;
  saveQuestionResult(questionResult: QuestionResultEntity): Promise<QuestionResultEntity>;

  // AI Evaluation Operations
  findAiEvaluationByResultId(resultId: string): Promise<AiEvaluationEntity | null>;
  saveAiEvaluation(evaluation: AiEvaluationEntity): Promise<AiEvaluationEntity>;

  // Creator Profile Operations
  findCreatorProfileById(id: string): Promise<CreatorProfileEntity | null>;
  findCreatorProfileByUserId(userId: string): Promise<CreatorProfileEntity | null>;
  findCreatorProfiles(limit?: number): Promise<CreatorProfileEntity[]>;
  saveCreatorProfile(profile: CreatorProfileEntity): Promise<CreatorProfileEntity>;

  // CollectionFavorite Operations
  findFavoritesByUserId(userId: string): Promise<CollectionFavorite[]>;
  findFavoritesWithCollectionsByUserId(userId: string): Promise<Array<CollectionFavorite & {
    collection: {
      id: string;
      title: string;
      description: string | null;
      ownerId: string;
      publishStatus: string;
    } | null;
    exams: Array<{ id: string; title: string; duration: number; totalQuestions: number }>;
  }>>;
  findFavoriteById(id: string): Promise<CollectionFavorite | null>;
  findFavoriteByUserAndCollection(
    userId: string,
    collectionId: string
  ): Promise<CollectionFavorite | null>;
  saveFavorite(favorite: {
    userId: string;
    collectionId: string;
  }): Promise<CollectionFavorite>;
  deleteFavorite(userId: string, collectionId: string): Promise<void>;

  // CollectionBookmark Operations
  findBookmarksByUserId(userId: string): Promise<CollectionBookmark[]>;
  findBookmarksWithCollectionsByUserId(userId: string): Promise<Array<{
    id: string;
    collectionId: string;
    userId: string;
    createdAt: Date;
    collection: {
      id: string;
      title: string;
      description: string | null;
      ownerId: string;
      publishStatus: string;
      examCount: number;
      itemCount: number;
    } | null;
  }>>;
  findBookmarksWithDetailsByUserId(userId: string): Promise<Array<CollectionBookmark & {
    collection: {
      id: string;
      title: string;
      description: string | null;
      ownerId: string;
      publishStatus: string;
    } | null;
    exams: Array<{ id: string; title: string; duration: number; totalQuestions: number }>;
  }>>;
  findBookmarkById(id: string): Promise<CollectionBookmark | null>;
  findBookmarkByUserAndCollection(
    userId: string,
    collectionId: string
  ): Promise<CollectionBookmark | null>;
  saveBookmark(bookmark: {
    userId: string;
    collectionId: string;
  }): Promise<CollectionBookmark>;
  deleteBookmark(userId: string, collectionId: string): Promise<void>;

  // UserDownload Operations
  findDownloadsByUserId(userId: string): Promise<UserDownload[]>;
  saveDownload(download: {
    userId: string;
    itemType: string;
    itemId: string;
    fileName: string;
    fileSize: number;
    downloadUrl?: string;
  }): Promise<UserDownload>;
  deleteDownload(id: string): Promise<void>;
  deleteAllDownloads(userId: string): Promise<void>;

  // CollectionPurchase Operations
  findPurchasesByUserId(userId: string): Promise<CollectionPurchase[]>;
  findPurchaseByUserAndCollection(
    userId: string,
    collectionId: string
  ): Promise<CollectionPurchase | null>;
  savePurchase(purchase: {
    userId: string;
    collectionId: string;
    amount?: number;
    currency?: string;
  }): Promise<CollectionPurchase>;

  // CollectionReport Operations
  saveReport(report: {
    collectionId: string;
    userId: string;
    reason?: string;
  }): Promise<CollectionReport>;

  // CollectionReview Operations
  findReviewsByCollectionId(collectionId: string): Promise<CollectionReview[]>;
  findReviewsByCollectionIdWithUser(collectionId: string): Promise<Array<CollectionReview & {
    user: { name: string | null; email: string; picture: string | null } | null;
  }>>;
  findReviewById(id: string): Promise<CollectionReview | null>;
  findReviewByUserAndCollection(
    userId: string,
    collectionId: string
  ): Promise<CollectionReview | null>;
  saveReview(review: {
    collectionId: string;
    userId: string;
    rating: number;
    text: string;
  }): Promise<CollectionReview>;
  saveReviewWithUser(review: {
    collectionId: string;
    userId: string;
    rating: number;
    text: string;
  }): Promise<CollectionReview & {
    user: { name: string | null; email: string; picture: string | null } | null;
  }>;
  deleteReview(id: string): Promise<void>;

  // CollectionDiscussion Operations
  findDiscussionsByCollectionId(collectionId: string): Promise<CollectionDiscussion[]>;
  findDiscussionById(id: string): Promise<CollectionDiscussion | null>;
  saveDiscussion(discussion: {
    collectionId: string;
    userId: string;
    title: string;
    content: string;
  }): Promise<CollectionDiscussion>;
  deleteDiscussion(id: string): Promise<void>;

  // DiscussionReply Operations
  findRepliesByDiscussionId(discussionId: string): Promise<DiscussionReply[]>;
  saveReply(reply: {
    discussionId: string;
    userId: string;
    content: string;
  }): Promise<DiscussionReply>;
  deleteReply(id: string): Promise<void>;
}
