import { Injectable } from '@nestjs/common';
import {
  UserDownload,
  CollectionPurchase,
  CollectionReport,
  CollectionReview,
  CollectionDiscussion,
  DiscussionReply,
} from '../../domain/types/certification-domain.types';
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
import { QuestionEntity } from '../../domain/entities/question.entity';
import { QuestionMetadataEntity } from '../../domain/entities/question-metadata.entity';
import { SkillResultEntity } from '../../domain/entities/skill-result.entity';
import { QuestionResultEntity } from '../../domain/entities/question-result.entity';
import { AiEvaluationEntity } from '../../domain/entities/ai-evaluation.entity';
import { CreatorProfileEntity } from '../../domain/entities/creator-profile.entity';
import { ICertificationRepository } from '../../domain/repositories/certification.repository.interface';
import { QueryParams } from '@spark-nest-ed/shared-libs';
import { CollectionRepository } from './collection.repository';
import { ExamRepository } from './exam.repository';
import { QuestionRepository } from './question.repository';
import { ExamQuestionRepository } from './exam-question.repository';
import { QuestionBatchRepository } from './question-batch.repository';
import { SessionRepository } from './session.repository';
import { ResultRepository } from './result.repository';
import { SocialRepository } from './social.repository';

@Injectable()
export class CertificationRepository implements ICertificationRepository {
  constructor(
    private readonly collectionRepo: CollectionRepository,
    private readonly examRepo: ExamRepository,
    private readonly questionRepo: QuestionRepository,
    private readonly examQuestionRepo: ExamQuestionRepository,
    private readonly questionBatchRepo: QuestionBatchRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly resultRepo: ResultRepository,
    private readonly socialRepo: SocialRepository,
  ) {}

  // ============================================
  // COLLECTION OPERATIONS
  // ============================================

  findCollections(queryParams?: QueryParams) {
    return this.collectionRepo.findCollections(queryParams);
  }

  findCollectionById(id: string): Promise<CollectionEntity | null> {
    return this.collectionRepo.findCollectionById(id);
  }

  saveCollection(collection: CollectionEntity): Promise<CollectionEntity> {
    return this.collectionRepo.saveCollection(collection);
  }

  cloneCollection(sourceCollectionId: string, newOwnerId: string): Promise<CollectionEntity> {
    return this.collectionRepo.cloneCollection(sourceCollectionId, newOwnerId);
  }

  findClonedCollectionsByUserId(userId: string) {
    return this.collectionRepo.findClonedCollectionsByUserId(userId);
  }

  findCollectionsByOwnerId(userId: string) {
    return this.collectionRepo.findCollectionsByOwnerId(userId);
  }

  deleteCollection(id: string): Promise<void> {
    return this.collectionRepo.deleteCollection(id);
  }

  findActivitiesByCollectionId(
    collectionId: string,
    limit = 10
  ): Promise<Array<{ user: string; action: string; time: string }>> {
    return this.collectionRepo.findActivitiesByCollectionId(collectionId, limit);
  }

  // ============================================
  // EXAM OPERATIONS
  // ============================================

  findExams(queryParams?: QueryParams) {
    return this.examRepo.findExams(queryParams);
  }

  findExamById(id: string): Promise<ExamEntity | null> {
    return this.examRepo.findExamById(id);
  }

  findExamsByCollectionId(collectionId: string): Promise<ExamEntity[]> {
    return this.examRepo.findExamsByCollectionId(collectionId);
  }

  saveExam(exam: ExamEntity): Promise<ExamEntity> {
    return this.examRepo.saveExam(exam);
  }

  deleteExam(id: string): Promise<void> {
    return this.examRepo.deleteExam(id);
  }

  findExamsByChapterId(chapterId: string): Promise<ExamEntity[]> {
    return this.examRepo.findExamsByChapterId(chapterId);
  }

  updateExamChapterId(examId: string, chapterId: string | null): Promise<void> {
    return this.examRepo.updateExamChapterId(examId, chapterId);
  }

  updateExamOrder(examId: string, order: number): Promise<void> {
    return this.examRepo.updateExamOrder(examId, order);
  }

  updateExamInitializationStatus(examId: string, status: string): Promise<void> {
    return this.examRepo.updateExamInitializationStatus(examId, status);
  }

  // ============================================
  // CHAPTER OPERATIONS
  // ============================================

  findChapterById(id: string): Promise<ChapterEntity | null> {
    return this.examRepo.findChapterById(id);
  }

  findChaptersByCollectionId(collectionId: string): Promise<ChapterEntity[]> {
    return this.examRepo.findChaptersByCollectionId(collectionId);
  }

  saveChapter(chapter: ChapterEntity): Promise<ChapterEntity> {
    return this.examRepo.saveChapter(chapter);
  }

  deleteChapter(id: string): Promise<void> {
    return this.examRepo.deleteChapter(id);
  }

  // ============================================
  // EXAM SECTION OPERATIONS
  // ============================================

  findSectionsByExamId(examId: string): Promise<ExamSectionEntity[]> {
    return this.examRepo.findSectionsByExamId(examId);
  }

  findSectionById(id: string): Promise<ExamSectionEntity | null> {
    return this.examRepo.findSectionById(id);
  }

  saveExamSection(section: ExamSectionEntity): Promise<ExamSectionEntity> {
    return this.examRepo.saveExamSection(section);
  }

  updateSectionMetadata(sectionId: string, data: {
    title?: string;
    subtitle?: string | null;
    instruction?: string | null;
    order?: number;
    durationMinutes?: number;
    questionCount?: number;
  }): Promise<void> {
    return this.examRepo.updateSectionMetadata(sectionId, data);
  }

  deleteExamSection(id: string): Promise<void> {
    return this.examRepo.deleteExamSection(id);
  }

  deleteAllSectionsByExamId(examId: string): Promise<void> {
    return this.examRepo.deleteAllSectionsByExamId(examId);
  }

  // ============================================
  // EXAM SESSION OPERATIONS
  // ============================================

  findSessionById(id: string): Promise<ExamSessionEntity | null> {
    return this.sessionRepo.findSessionById(id);
  }

  saveSession(session: ExamSessionEntity): Promise<ExamSessionEntity> {
    return this.sessionRepo.saveSession(session);
  }

  findSessionsByUserId(userId: string): Promise<ExamSessionEntity[]> {
    return this.sessionRepo.findSessionsByUserId(userId);
  }

  findInProgressSessionsByUserId(userId: string) {
    return this.sessionRepo.findInProgressSessionsByUserId(userId);
  }

  // ============================================
  // EXAM RESULT OPERATIONS
  // ============================================

  findResultById(id: string): Promise<ExamResultEntity | null> {
    return this.resultRepo.findResultById(id);
  }

  findResultBySessionId(sessionId: string): Promise<ExamResultEntity | null> {
    return this.resultRepo.findResultBySessionId(sessionId);
  }

  saveResult(result: ExamResultEntity): Promise<ExamResultEntity> {
    return this.resultRepo.saveResult(result);
  }

  findResultsByUserId(userId: string): Promise<ExamResultEntity[]> {
    return this.resultRepo.findResultsByUserId(userId);
  }

  // ============================================
  // QUESTION OPERATIONS
  // ============================================

  findQuestionById(id: string): Promise<QuestionEntity | null> {
    return this.questionRepo.findQuestionById(id);
  }

  findQuestionsByIds(ids: string[]): Promise<QuestionEntity[]> {
    return this.questionRepo.findQuestionsByIds(ids);
  }

  findQuestionVersionsByQuestionId(questionId: string) {
    return this.questionRepo.findQuestionVersionsByQuestionId(questionId);
  }

  saveQuestion(question: QuestionEntity): Promise<QuestionEntity> {
    return this.questionRepo.saveQuestion(question);
  }

  deleteQuestion(id: string): Promise<void> {
    return this.questionRepo.deleteQuestion(id);
  }

  findQuestionWithBuilderData(id: string) {
    return this.questionRepo.findQuestionWithBuilderData(id);
  }

  saveQuestionWithChoices(
    question: QuestionEntity,
    choices: QuestionChoiceEntity[],
    metadata: QuestionMetadataEntity | null
  ): Promise<void> {
    return this.questionRepo.saveQuestionWithChoices(question, choices, metadata);
  }

  deleteQuestionCascade(id: string): Promise<void> {
    return this.questionRepo.deleteQuestionCascade(id);
  }

  // ============================================
  // QUESTION METADATA OPERATIONS
  // ============================================

  findMetadataByQuestionId(questionId: string): Promise<QuestionMetadataEntity | null> {
    return this.questionRepo.findMetadataByQuestionId(questionId);
  }

  saveQuestionMetadata(metadata: QuestionMetadataEntity): Promise<QuestionMetadataEntity> {
    return this.questionRepo.saveQuestionMetadata(metadata);
  }

  // ============================================
  // QUESTION CHOICE OPERATIONS
  // ============================================

  saveQuestionChoice(choice: QuestionChoiceEntity): Promise<QuestionChoiceEntity> {
    return this.questionRepo.saveQuestionChoice(choice);
  }

  deleteQuestionChoice(id: string): Promise<void> {
    return this.questionRepo.deleteQuestionChoice(id);
  }

  findChoicesByQuestionId(questionId: string): Promise<QuestionChoiceEntity[]> {
    return this.questionRepo.findChoicesByQuestionId(questionId);
  }

  // ============================================
  // ANSWERS, QUESTIONS, CHOICES, VIOLATIONS
  // ============================================

  findAnswersBySessionId(sessionId: string): Promise<SessionAnswerEntity[]> {
    return this.sessionRepo.findAnswersBySessionId(sessionId);
  }

  saveSessionAnswer(answer: SessionAnswerEntity): Promise<SessionAnswerEntity> {
    return this.sessionRepo.saveSessionAnswer(answer);
  }

  saveViolation(violation: SessionViolationEntity): Promise<SessionViolationEntity> {
    return this.sessionRepo.saveViolation(violation);
  }

  findExamQuestionsByExamId(examId: string): Promise<ExamQuestionEntity[]> {
    return this.examQuestionRepo.findExamQuestionsByExamId(examId);
  }

  findExamQuestionsByExamIdAndSectionId(examId: string, sectionId: string): Promise<ExamQuestionEntity[]> {
    return this.examQuestionRepo.findExamQuestionsByExamIdAndSectionId(examId, sectionId);
  }

  deleteExamQuestionsByIds(examId: string, questionIds: string[]): Promise<void> {
    return this.examQuestionRepo.deleteExamQuestionsByIds(examId, questionIds);
  }

  deleteQuestionsByIds(questionIds: string[]): Promise<void> {
    return this.questionRepo.deleteQuestionsByIds(questionIds);
  }

  findSectionQuestionsPaginated(params: {
    examId: string;
    sectionId: string;
    page: number;
    pageSize: number;
    search?: string;
  }) {
    return this.examQuestionRepo.findSectionQuestionsPaginated(params);
  }

  findExamQuestionsByQuestionId(questionId: string): Promise<ExamQuestionEntity[]> {
    return this.examQuestionRepo.findExamQuestionsByQuestionId(questionId);
  }

  findExamQuestionByExamAndQuestion(examId: string, questionId: string): Promise<ExamQuestionEntity | null> {
    return this.examQuestionRepo.findExamQuestionByExamAndQuestion(examId, questionId);
  }

  saveExamQuestion(entity: ExamQuestionEntity): Promise<ExamQuestionEntity> {
    return this.examQuestionRepo.saveExamQuestion(entity);
  }

  deleteExamQuestion(examId: string, questionId: string): Promise<boolean> {
    return this.examQuestionRepo.deleteExamQuestion(examId, questionId);
  }

  deleteAllExamQuestionsByExamId(examId: string): Promise<void> {
    return this.examQuestionRepo.deleteAllExamQuestionsByExamId(examId);
  }

  countExamQuestionsByExamId(examId: string): Promise<number> {
    return this.examQuestionRepo.countExamQuestionsByExamId(examId);
  }

  countExamQuestionsBySectionId(examId: string, sectionId: string): Promise<number> {
    return this.examQuestionRepo.countExamQuestionsBySectionId(examId, sectionId);
  }

  batchCountQuestionsBySectionIds(examId: string, sectionIds: string[]): Promise<Map<string, number>> {
    return this.examQuestionRepo.batchCountQuestionsBySectionIds(examId, sectionIds);
  }

  // ============================================
  // TRANSACTION SUPPORT
  // ============================================

  withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.questionBatchRepo.withTransaction(fn);
  }

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
      audioMediaId?: string;
      imageMediaId?: string;
      passageGroupId?: string;
      passageText?: string;
      passageType?: string;
      passageTitle?: string;
      blankNumber?: number;
      subQuestionNumber?: number;
      formatMetadata?: Record<string, unknown>;
      detailedExplanation?: string;
      sectionId: string;
      sectionOrder: number;
      order: number;
      linkId?: string;
    }>;
  }): Promise<number> {
    return this.questionBatchRepo.batchUpsertQuestionsForPatch(params);
  }

  upsertChoicesDifferential(
    questionId: string,
    newChoices: Array<{ text: string; isCorrect: boolean; order: number }>,
    userId: string,
  ): Promise<void> {
    return this.questionBatchRepo.upsertChoicesDifferential(questionId, newChoices, userId);
  }

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
        audioMediaId: string | null;
        imageMediaId: string | null;
        partNumber: number;
        formatMetadata: unknown | null;
        passageGroupId: string | null;
        passageType: string | null;
        passageTitle: string | null;
        blankNumber: number | null;
        subQuestionNumber: number | null;
      };
    }>;
  }): Promise<number> {
    return this.questionBatchRepo.batchInitializeExamQuestions(params);
  }

  // ============================================
  // SKILL RESULT OPERATIONS
  // ============================================

  findSkillResultsByResultId(resultId: string): Promise<SkillResultEntity[]> {
    return this.resultRepo.findSkillResultsByResultId(resultId);
  }

  saveSkillResult(skillResult: SkillResultEntity): Promise<SkillResultEntity> {
    return this.resultRepo.saveSkillResult(skillResult);
  }

  // ============================================
  // QUESTION RESULT OPERATIONS
  // ============================================

  findQuestionResultsByResultId(resultId: string): Promise<QuestionResultEntity[]> {
    return this.resultRepo.findQuestionResultsByResultId(resultId);
  }

  saveQuestionResult(questionResult: QuestionResultEntity): Promise<QuestionResultEntity> {
    return this.resultRepo.saveQuestionResult(questionResult);
  }

  // ============================================
  // AI EVALUATION OPERATIONS
  // ============================================

  findAiEvaluationByResultId(resultId: string): Promise<AiEvaluationEntity | null> {
    return this.resultRepo.findAiEvaluationByResultId(resultId);
  }

  saveAiEvaluation(evaluation: AiEvaluationEntity): Promise<AiEvaluationEntity> {
    return this.resultRepo.saveAiEvaluation(evaluation);
  }

  // ============================================
  // CREATOR PROFILE OPERATIONS
  // ============================================

  findCreatorProfileById(id: string): Promise<CreatorProfileEntity | null> {
    return this.resultRepo.findCreatorProfileById(id);
  }

  findCreatorProfileByUserId(userId: string): Promise<CreatorProfileEntity | null> {
    return this.resultRepo.findCreatorProfileByUserId(userId);
  }

  findCreatorProfiles(limit?: number): Promise<CreatorProfileEntity[]> {
    return this.resultRepo.findCreatorProfiles(limit);
  }

  saveCreatorProfile(profile: CreatorProfileEntity): Promise<CreatorProfileEntity> {
    return this.resultRepo.saveCreatorProfile(profile);
  }

  // ============================================
  // COLLECTION FAVORITE OPERATIONS
  // ============================================

  findFavoritesByUserId(userId: string) {
    return this.socialRepo.findFavoritesByUserId(userId);
  }

  findFavoritesWithCollectionsByUserId(userId: string) {
    return this.socialRepo.findFavoritesWithCollectionsByUserId(userId);
  }

  findFavoriteById(id: string) {
    return this.socialRepo.findFavoriteById(id);
  }

  findFavoriteByUserAndCollection(userId: string, collectionId: string) {
    return this.socialRepo.findFavoriteByUserAndCollection(userId, collectionId);
  }

  saveFavorite(favorite: { userId: string; collectionId: string }) {
    return this.socialRepo.saveFavorite(favorite);
  }

  deleteFavorite(userId: string, collectionId: string): Promise<void> {
    return this.socialRepo.deleteFavorite(userId, collectionId);
  }

  // ============================================
  // COLLECTION BOOKMARK OPERATIONS
  // ============================================

  findBookmarksByUserId(userId: string) {
    return this.socialRepo.findBookmarksByUserId(userId);
  }

  findBookmarksWithDetailsByUserId(userId: string) {
    return this.socialRepo.findBookmarksWithDetailsByUserId(userId);
  }

  findBookmarkById(id: string) {
    return this.socialRepo.findBookmarkById(id);
  }

  findBookmarksWithCollectionsByUserId(userId: string) {
    return this.socialRepo.findBookmarksWithCollectionsByUserId(userId);
  }

  findBookmarkByUserAndCollection(userId: string, collectionId: string) {
    return this.socialRepo.findBookmarkByUserAndCollection(userId, collectionId);
  }

  saveBookmark(bookmark: { userId: string; collectionId: string }) {
    return this.socialRepo.saveBookmark(bookmark);
  }

  deleteBookmark(userId: string, collectionId: string): Promise<void> {
    return this.socialRepo.deleteBookmark(userId, collectionId);
  }

  // ============================================
  // USER DOWNLOAD OPERATIONS
  // ============================================

  findDownloadsByUserId(userId: string): Promise<UserDownload[]> {
    return this.socialRepo.findDownloadsByUserId(userId);
  }

  saveDownload(download: {
    userId: string;
    itemType: string;
    itemId: string;
    fileName: string;
    fileSize: number;
    downloadUrl?: string;
  }): Promise<UserDownload> {
    return this.socialRepo.saveDownload(download);
  }

  deleteDownload(id: string): Promise<void> {
    return this.socialRepo.deleteDownload(id);
  }

  deleteAllDownloads(userId: string): Promise<void> {
    return this.socialRepo.deleteAllDownloads(userId);
  }

  // ============================================
  // COLLECTION PURCHASE OPERATIONS
  // ============================================

  findPurchasesByUserId(userId: string): Promise<CollectionPurchase[]> {
    return this.socialRepo.findPurchasesByUserId(userId);
  }

  findPurchaseByUserAndCollection(userId: string, collectionId: string): Promise<CollectionPurchase | null> {
    return this.socialRepo.findPurchaseByUserAndCollection(userId, collectionId);
  }

  savePurchase(purchase: {
    userId: string;
    collectionId: string;
    amount?: number;
    currency?: string;
  }): Promise<CollectionPurchase> {
    return this.socialRepo.savePurchase(purchase);
  }

  // ============================================
  // COLLECTION REPORT OPERATIONS
  // ============================================

  saveReport(report: {
    collectionId: string;
    userId: string;
    reason?: string;
  }): Promise<CollectionReport> {
    return this.socialRepo.saveReport(report);
  }

  // ============================================
  // COLLECTION REVIEW OPERATIONS
  // ============================================

  findReviewsByCollectionId(collectionId: string): Promise<CollectionReview[]> {
    return this.socialRepo.findReviewsByCollectionId(collectionId);
  }

  findReviewsByCollectionIdWithUser(collectionId: string) {
    return this.socialRepo.findReviewsByCollectionIdWithUser(collectionId);
  }

  findReviewById(id: string) {
    return this.socialRepo.findReviewById(id);
  }

  findReviewByUserAndCollection(userId: string, collectionId: string) {
    return this.socialRepo.findReviewByUserAndCollection(userId, collectionId);
  }

  saveReview(review: { collectionId: string; userId: string; rating: number; text: string }): Promise<CollectionReview> {
    return this.socialRepo.saveReview(review);
  }

  saveReviewWithUser(review: { collectionId: string; userId: string; rating: number; text: string }) {
    return this.socialRepo.saveReviewWithUser(review);
  }

  deleteReview(id: string): Promise<void> {
    return this.socialRepo.deleteReview(id);
  }

  // ============================================
  // COLLECTION DISCUSSION OPERATIONS
  // ============================================

  findDiscussionsByCollectionId(collectionId: string): Promise<CollectionDiscussion[]> {
    return this.socialRepo.findDiscussionsByCollectionId(collectionId);
  }

  findDiscussionById(id: string) {
    return this.socialRepo.findDiscussionById(id);
  }

  saveDiscussion(discussion: { collectionId: string; userId: string; title: string; content: string }): Promise<CollectionDiscussion> {
    return this.socialRepo.saveDiscussion(discussion);
  }

  deleteDiscussion(id: string): Promise<void> {
    return this.socialRepo.deleteDiscussion(id);
  }

  // ============================================
  // DISCUSSION REPLY OPERATIONS
  // ============================================

  findRepliesByDiscussionId(discussionId: string): Promise<DiscussionReply[]> {
    return this.socialRepo.findRepliesByDiscussionId(discussionId);
  }

  saveReply(reply: { discussionId: string; userId: string; content: string }): Promise<DiscussionReply> {
    return this.socialRepo.saveReply(reply);
  }

  deleteReply(id: string): Promise<void> {
    return this.socialRepo.deleteReply(id);
  }
}
