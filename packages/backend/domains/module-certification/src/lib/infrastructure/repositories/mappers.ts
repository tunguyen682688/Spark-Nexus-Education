import {
  Collection,
  CollectionItem,
  Exam,
  Chapter,
  ExamSection,
  ExamSession,
  ExamResult,
  Question,
  SessionAnswer,
  ExamQuestion,
  QuestionChoice,
  SessionViolation,
  SkillResult,
  QuestionResult,
  AiEvaluation,
  CreatorProfile,
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
import { QuestionEntity } from '../../domain/entities/question.entity';
import { QuestionMetadataEntity } from '../../domain/entities/question-metadata.entity';
import { SkillResultEntity } from '../../domain/entities/skill-result.entity';
import { QuestionResultEntity } from '../../domain/entities/question-result.entity';
import { AiEvaluationEntity } from '../../domain/entities/ai-evaluation.entity';
import { CreatorProfileEntity } from '../../domain/entities/creator-profile.entity';

export function mapCollectionToEntity(
  dbObj: Collection & { items?: CollectionItem[]; exams?: Exam[] }
): CollectionEntity {
  return CollectionEntity.create({
    id: dbObj.id,
    title: dbObj.title,
    description: dbObj.description ?? undefined,
    subtitle: dbObj.subtitle ?? undefined,
    level: dbObj.level ?? undefined,
    tags: dbObj.tags ?? [],
    visibility: dbObj.visibility,
    allowDownloads: dbObj.allowDownloads,
    coverImage: dbObj.coverImage ?? undefined,
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

export function mapExamToEntity(dbObj: Exam): ExamEntity {
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
    order: dbObj.order,
    examType: dbObj.examType ?? 'FULL_MOCK',
    certificationType: dbObj.certificationType ?? null,
    level: dbObj.level ?? null,
    initializationStatus: (dbObj as Record<string, unknown>).initializationStatus as string ?? 'none',
    createdBy: dbObj.createdBy,
    updatedBy: dbObj.updatedBy,
    createdAt: dbObj.createdAt,
    updatedAt: dbObj.updatedAt,
    deletedAt: dbObj.deletedAt ?? undefined,
    version: dbObj.version,
  });
}

export function mapChapterToEntity(dbObj: Chapter): ChapterEntity {
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

export function mapSectionToEntity(dbObj: ExamSection): ExamSectionEntity {
  return ExamSectionEntity.create({
    id: dbObj.id,
    examId: dbObj.examId,
    title: dbObj.title,
    subtitle: dbObj.subtitle ?? undefined,
    sectionType: dbObj.sectionType ?? 'general',
    instruction: dbObj.instruction ?? undefined,
    order: dbObj.order,
    durationMinutes: dbObj.durationMinutes ?? 0,
    questionCount: dbObj.questionCount ?? 0,
    isBreak: dbObj.isBreak ?? false,
    audioMediaId: dbObj.audioMediaId ?? undefined,
    scriptText: dbObj.scriptText ?? undefined,
    passageText: dbObj.passageText ?? undefined,
    passageTitle: dbObj.passageTitle ?? undefined,
    passageType: dbObj.passageType ?? undefined,
    createdAt: dbObj.createdAt,
    updatedAt: dbObj.updatedAt,
  });
}

export function mapSessionToEntity(dbObj: ExamSession): ExamSessionEntity {
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

export function mapResultToEntity(dbObj: ExamResult): ExamResultEntity {
  return ExamResultEntity.create({
    id: dbObj.id,
    sessionId: dbObj.sessionId,
    examId: dbObj.examId,
    userId: dbObj.userId,
    totalScore: dbObj.totalScore,
    maxScore: dbObj.maxScore ?? 100.0,
    accuracyRate: dbObj.accuracyRate ?? 0.0,
    timeSpentMinutes: dbObj.timeSpentMinutes ?? 0,
    passed: dbObj.passed,
    completedAt: dbObj.completedAt ?? null,
    createdAt: dbObj.createdAt,
    updatedAt: dbObj.updatedAt,
  });
}

export function mapQuestionToEntity(dbObj: Question): QuestionEntity {
  return QuestionEntity.create({
    id: dbObj.id,
    title: dbObj.title,
    content: dbObj.content,
    type: dbObj.type,
    difficulty: dbObj.difficulty,
    category: dbObj.category ?? null,
    status: dbObj.status,
    createdBy: dbObj.createdBy,
    updatedBy: dbObj.updatedBy,
    createdAt: dbObj.createdAt,
    updatedAt: dbObj.updatedAt,
    deletedAt: dbObj.deletedAt ?? undefined,
    version: dbObj.version,
  });
}

export function mapAnswerToEntity(dbObj: SessionAnswer): SessionAnswerEntity {
  return SessionAnswerEntity.create({
    id: dbObj.id,
    sessionId: dbObj.sessionId,
    questionId: dbObj.questionId,
    answerText: dbObj.answerText,
    choiceIds: dbObj.choiceIds,
    isCorrect: dbObj.isCorrect,
    points: dbObj.points,
    savedAt: dbObj.savedAt,
    createdBy: dbObj.createdBy,
    updatedBy: dbObj.updatedBy,
    createdAt: dbObj.createdAt,
    updatedAt: dbObj.updatedAt,
  });
}

export function mapExamQuestionToEntity(dbObj: ExamQuestion): ExamQuestionEntity {
  return ExamQuestionEntity.create({
    id: dbObj.id,
    examId: dbObj.examId,
    questionId: dbObj.questionId,
    sectionId: dbObj.sectionId,
    order: dbObj.order,
    points: dbObj.points,
    createdBy: dbObj.createdBy,
    updatedBy: dbObj.updatedBy,
    createdAt: dbObj.createdAt,
    updatedAt: dbObj.updatedAt,
    audioMediaId: dbObj.audioMediaId,
    imageMediaId: dbObj.imageMediaId,
    partNumber: dbObj.partNumber,
    gapNumber: dbObj.gapNumber,
    writingTaskType: dbObj.writingTaskType,
    speakingPrompt: dbObj.speakingPrompt,
    isGridIn: dbObj.isGridIn,
    formatMetadata: dbObj.formatMetadata,
    passageGroupId: dbObj.passageGroupId,
    blankNumber: dbObj.blankNumber,
    subQuestionNumber: dbObj.subQuestionNumber,
    passageTitle: dbObj.passageTitle,
    passageType: dbObj.passageType,
  });
}

export function mapChoiceToEntity(dbObj: QuestionChoice): QuestionChoiceEntity {
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

export function mapMetadataToEntity(dbObj: {
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
  passageId: string | null;
  passageText: string | null;
  modelAnswer: string | null;
  rubric: unknown;
  matchingPairs: unknown;
  wordRoot: string | null;
  keyWord: string | null;
  media: unknown;
  hints: unknown;
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
    passageId: dbObj.passageId,
    passageText: dbObj.passageText,
    modelAnswer: dbObj.modelAnswer,
    rubric: dbObj.rubric,
    matchingPairs: dbObj.matchingPairs,
    wordRoot: dbObj.wordRoot,
    keyWord: dbObj.keyWord,
    media: dbObj.media,
    hints: dbObj.hints,
    createdAt: dbObj.createdAt,
    updatedAt: dbObj.updatedAt,
  });
}

export function mapQuestionType(type?: string): string {
  switch (type) {
    case 'multiple_choice': return 'Multiple Choice';
    case 'fill_in_blank': return 'Fill in Blank';
    case 'essay': return 'Essay';
    case 'single_choice':
    default: return 'Single Choice';
  }
}

export function mapDifficulty(diff?: string): string {
  switch (diff) {
    case 'easy': return 'Easy';
    case 'hard': return 'Hard';
    case 'medium':
    default: return 'Medium';
  }
}

export function mapViolationToEntity(dbObj: SessionViolation): SessionViolationEntity {
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

export function mapSkillResultToEntity(dbObj: SkillResult): SkillResultEntity {
  return SkillResultEntity.create({
    id: dbObj.id,
    resultId: dbObj.resultId,
    skillName: dbObj.skillName,
    score: dbObj.score,
    maxScore: dbObj.maxScore,
    accuracyRate: dbObj.accuracyRate,
    feedback: dbObj.feedback ?? null,
    createdAt: dbObj.createdAt,
  });
}

export function mapQuestionResultToEntity(dbObj: QuestionResult): QuestionResultEntity {
  return QuestionResultEntity.create({
    id: dbObj.id,
    resultId: dbObj.resultId,
    questionId: dbObj.questionId,
    questionText: dbObj.questionText ?? null,
    isCorrect: dbObj.isCorrect,
    scoreAwarded: dbObj.scoreAwarded,
    userAnswer: dbObj.userAnswer ?? null,
    correctAnswer: dbObj.correctAnswer ?? null,
    explanation: dbObj.explanation ?? null,
    timeSpent: dbObj.timeSpent,
    createdAt: dbObj.createdAt,
  });
}

export function mapAiEvaluationToEntity(dbObj: AiEvaluation): AiEvaluationEntity {
  return AiEvaluationEntity.create({
    id: dbObj.id,
    resultId: dbObj.resultId,
    evaluationText: dbObj.evaluationText,
    feedbackJson: dbObj.feedbackJson as Prisma.JsonValue,
    createdAt: dbObj.createdAt,
  });
}

export function mapCreatorProfileToEntity(dbObj: CreatorProfile): CreatorProfileEntity {
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
