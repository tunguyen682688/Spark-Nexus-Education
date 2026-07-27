import { CollectionEntity } from '../entities/collection.entity';
import { ExamEntity } from '../entities/exam.entity';
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
  saveExam(exam: ExamEntity): Promise<ExamEntity>;
  deleteExam(id: string): Promise<void>;

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

  // Exam Result Operations
  findResultById(id: string): Promise<ExamResultEntity | null>;
  findResultBySessionId(sessionId: string): Promise<ExamResultEntity | null>;
  saveResult(result: ExamResultEntity): Promise<ExamResultEntity>;
  findResultsByUserId(userId: string): Promise<ExamResultEntity[]>;

  // Question Operations
  findQuestionById(id: string): Promise<QuestionEntity | null>;
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
}
