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
import { ExamRuleEntity } from '../entities/exam-rule.entity';
import { QuestionEntity } from '../entities/question.entity';
import { QuestionMetadataEntity } from '../entities/question-metadata.entity';
import { QuestionHintEntity } from '../entities/question-hint.entity';
import { QuestionMediaEntity } from '../entities/question-media.entity';
import { AutosaveSnapshotEntity } from '../entities/autosave-snapshot.entity';
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

  // Chapter Operations
  findChaptersByCollectionId(collectionId: string): Promise<ChapterEntity[]>;
  saveChapter(chapter: ChapterEntity): Promise<ChapterEntity>;
  deleteChapter(id: string): Promise<void>;

  // Exam Section Operations
  findSectionsByExamId(examId: string): Promise<ExamSectionEntity[]>;
  saveExamSection(section: ExamSectionEntity): Promise<ExamSectionEntity>;
  deleteExamSection(id: string): Promise<void>;

  // Exam Rule Operations
  findRulesByExamId(examId: string): Promise<ExamRuleEntity[]>;
  saveExamRule(rule: ExamRuleEntity): Promise<ExamRuleEntity>;
  deleteExamRule(id: string): Promise<void>;

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

  // Question Operations
  findQuestionById(id: string): Promise<QuestionEntity | null>;
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
  } | null>;
  saveQuestionWithChoices(
    question: QuestionEntity,
    choices: QuestionChoiceEntity[],
    metadata: QuestionMetadataEntity | null
  ): Promise<void>;
  deleteQuestionCascade(id: string): Promise<void>;

  // Question Metadata Operations
  findMetadataByQuestionId(questionId: string): Promise<QuestionMetadataEntity | null>;
  saveQuestionMetadata(metadata: QuestionMetadataEntity): Promise<QuestionMetadataEntity>;

  // Question Choice Operations
  saveQuestionChoice(choice: QuestionChoiceEntity): Promise<QuestionChoiceEntity>;
  deleteQuestionChoice(id: string): Promise<void>;

  // Question Hint Operations
  findHintsByQuestionId(questionId: string): Promise<QuestionHintEntity[]>;
  saveQuestionHint(hint: QuestionHintEntity): Promise<QuestionHintEntity>;
  deleteQuestionHint(id: string): Promise<void>;

  // Question Media Operations
  findMediaByQuestionId(questionId: string): Promise<QuestionMediaEntity[]>;
  saveQuestionMedia(media: QuestionMediaEntity): Promise<QuestionMediaEntity>;
  deleteQuestionMedia(id: string): Promise<void>;

  // Answers, Questions, Choices, Violations
  findAnswersBySessionId(sessionId: string): Promise<SessionAnswerEntity[]>;
  findQuestionsByExamId(examId: string): Promise<ExamQuestionEntity[]>;
  findExamQuestionsByQuestionId(questionId: string): Promise<ExamQuestionEntity[]>;
  findChoicesByQuestionId(questionId: string): Promise<QuestionChoiceEntity[]>;
  saveSessionAnswer(answer: SessionAnswerEntity): Promise<SessionAnswerEntity>;
  saveViolation(violation: SessionViolationEntity): Promise<SessionViolationEntity>;

  // Autosave Snapshot Operations
  findSnapshotsBySessionId(sessionId: string): Promise<AutosaveSnapshotEntity[]>;
  saveAutosaveSnapshot(snapshot: AutosaveSnapshotEntity): Promise<AutosaveSnapshotEntity>;

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
