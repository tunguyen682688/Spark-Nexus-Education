import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { Prisma } from '@prisma/client';
import { ExamResultEntity } from '../../domain/entities/exam-result.entity';
import { SkillResultEntity } from '../../domain/entities/skill-result.entity';
import { QuestionResultEntity } from '../../domain/entities/question-result.entity';
import { AiEvaluationEntity } from '../../domain/entities/ai-evaluation.entity';
import { CreatorProfileEntity } from '../../domain/entities/creator-profile.entity';
import {
  mapResultToEntity,
  mapSkillResultToEntity,
  mapQuestionResultToEntity,
  mapAiEvaluationToEntity,
  mapCreatorProfileToEntity,
} from './mappers';

@Injectable()
export class ResultRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findResultById(id: string): Promise<ExamResultEntity | null> {
    const result = await this.prisma.examResult.findUnique({
      where: { id },
      include: { skills: true, questions: true, evaluation: true },
    });
    if (!result) return null;
    return mapResultToEntity(result);
  }

  async findResultBySessionId(sessionId: string): Promise<ExamResultEntity | null> {
    const result = await this.prisma.examResult.findFirst({
      where: { sessionId },
      include: { skills: true, questions: true, evaluation: true },
    });
    if (!result) return null;
    return mapResultToEntity(result);
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
      create: { id: result.id, ...data },
      update: data,
    });
    return mapResultToEntity(saved);
  }

  async findResultsByUserId(userId: string): Promise<ExamResultEntity[]> {
    const results = await this.prisma.examResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((r) => mapResultToEntity(r));
  }

  async findSkillResultsByResultId(resultId: string): Promise<SkillResultEntity[]> {
    const skills = await this.prisma.skillResult.findMany({ where: { resultId } });
    return skills.map((s) => mapSkillResultToEntity(s));
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
      data: { id: skillResult.id, ...data },
    });
    return mapSkillResultToEntity(saved);
  }

  async findQuestionResultsByResultId(resultId: string): Promise<QuestionResultEntity[]> {
    const qr = await this.prisma.questionResult.findMany({ where: { resultId } });
    return qr.map((q) => mapQuestionResultToEntity(q));
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
      data: { id: questionResult.id, ...data },
    });
    return mapQuestionResultToEntity(saved);
  }

  async findAiEvaluationByResultId(resultId: string): Promise<AiEvaluationEntity | null> {
    const evaluation = await this.prisma.aiEvaluation.findUnique({ where: { resultId } });
    if (!evaluation) return null;
    return mapAiEvaluationToEntity(evaluation);
  }

  async saveAiEvaluation(evaluation: AiEvaluationEntity): Promise<AiEvaluationEntity> {
    const data = {
      resultId: evaluation.getResultId(),
      evaluationText: evaluation.getEvaluationText(),
      feedbackJson: evaluation.getFeedbackJson() as Prisma.InputJsonValue,
    };
    const saved = await this.prisma.aiEvaluation.create({
      data: { id: evaluation.id, ...data },
    });
    return mapAiEvaluationToEntity(saved);
  }

  async findCreatorProfileByUserId(userId: string): Promise<CreatorProfileEntity | null> {
    const profile = await this.prisma.creatorProfile.findFirst({ where: { userId } });
    if (!profile) return null;
    return mapCreatorProfileToEntity(profile);
  }

  async findCreatorProfileById(id: string): Promise<CreatorProfileEntity | null> {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { id } });
    if (!profile) return null;
    return mapCreatorProfileToEntity(profile);
  }

  async findCreatorProfiles(limit = 20): Promise<CreatorProfileEntity[]> {
    const profiles = await this.prisma.creatorProfile.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    return profiles.map((p) => mapCreatorProfileToEntity(p));
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
      create: { id: profile.id, ...data },
      update: data,
    });
    return mapCreatorProfileToEntity(saved);
  }
}
