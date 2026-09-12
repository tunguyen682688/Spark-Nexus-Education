import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { Prisma } from '@prisma/client';
import { ExamQuestionEntity } from '../../domain/entities/exam-question.entity';
import { mapExamQuestionToEntity, mapQuestionType, mapDifficulty } from './mappers';

@Injectable()
export class ExamQuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findExamQuestionsByExamId(examId: string): Promise<ExamQuestionEntity[]> {
    const eq = await this.prisma.examQuestion.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });
    return eq.map((item) => mapExamQuestionToEntity(item));
  }

  async findExamQuestionsByExamIdAndSectionId(examId: string, sectionId: string): Promise<ExamQuestionEntity[]> {
    const eq = await this.prisma.examQuestion.findMany({
      where: { examId, sectionId },
      orderBy: { order: 'asc' },
    });
    return eq.map((item) => mapExamQuestionToEntity(item));
  }

  async deleteExamQuestionsByIds(examId: string, questionIds: string[]): Promise<void> {
    if (questionIds.length === 0) return;
    await this.prisma.examQuestion.deleteMany({
      where: { examId, questionId: { in: questionIds } },
    });
  }

  async findSectionQuestionsPaginated(params: {
    examId: string;
    sectionId: string;
    page: number;
    pageSize: number;
    search?: string;
  }) {
    const { examId, sectionId, page, pageSize, search } = params;
    const skip = (Math.max(1, page) - 1) * pageSize;

    const questionFilter: Prisma.QuestionWhereInput = { deletedAt: null };
    if (search?.trim()) {
      questionFilter.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ];
    }

    const where: Prisma.ExamQuestionWhereInput = {
      examId,
      sectionId,
      question: questionFilter,
    };

    const [rows, total] = await Promise.all([
      this.prisma.examQuestion.findMany({
        where,
        include: {
          question: {
            select: {
              id: true,
              title: true,
              content: true,
              type: true,
              difficulty: true,
              metadata: {
                select: {
                  passageId: true,
                  passageText: true,
                  modelAnswer: true,
                  estimatedTime: true,
                  explanation: true,
                  points: true,
                },
              },
              choices: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  content: true,
                  isCorrect: true,
                  order: true,
                },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.examQuestion.count({ where }),
    ]);

    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
    const safePage = Math.max(1, Math.min(page, totalPages || 1));

    return {
      questions: rows.map((eq, idx) => ({
        examQuestionId: eq.id,
        id: eq.questionId,
        number: skip + idx + 1,
        title: eq.question?.title || eq.question?.content || `Question ${idx + 1}`,
        partTag: eq.partNumber ? `Part ${eq.partNumber}` : '',
        type: mapQuestionType(eq.question?.type),
        difficulty: mapDifficulty(eq.question?.difficulty),
        points: eq.points,
        imageMediaId: eq.imageMediaId ?? null,
        audioMediaId: eq.audioMediaId ?? null,
        partNumber: eq.partNumber ?? null,
        passageId: eq.question?.metadata?.passageId ?? null,
        passageText: eq.question?.metadata?.passageText ?? null,
        modelAnswer: eq.question?.metadata?.modelAnswer ?? null,
        explanation: eq.question?.metadata?.explanation ?? null,
        estimatedTime: eq.question?.metadata?.estimatedTime ? Number(eq.question.metadata.estimatedTime) : null,
        metadataPoints: eq.question?.metadata?.points ?? null,
        passageGroupId: eq.passageGroupId ?? null,
        passageType: eq.passageType ?? null,
        passageTitle: eq.passageTitle ?? null,
        blankNumber: eq.blankNumber ?? null,
        subQuestionNumber: eq.subQuestionNumber ?? null,
        formatMetadata: eq.formatMetadata ?? null,
        choices: (eq.question as any)?.choices?.map((c: any) => ({
          id: c.id,
          content: c.content,
          isCorrect: c.isCorrect,
          order: c.order,
        })) ?? null,
      })),
      totalCount: total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  async findExamQuestionsByQuestionId(questionId: string): Promise<ExamQuestionEntity[]> {
    const eq = await this.prisma.examQuestion.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });
    return eq.map((item) => mapExamQuestionToEntity(item));
  }

  async findExamQuestionByExamAndQuestion(examId: string, questionId: string): Promise<ExamQuestionEntity | null> {
    const eq = await this.prisma.examQuestion.findFirst({ where: { examId, questionId } });
    return eq ? mapExamQuestionToEntity(eq) : null;
  }

  async saveExamQuestion(entity: ExamQuestionEntity): Promise<ExamQuestionEntity> {
    const data = {
      examId: entity.getExamId(),
      questionId: entity.getQuestionId(),
      sectionId: entity.getSectionId(),
      order: entity.getOrder(),
      points: entity.getPoints(),
      createdBy: entity.getCreatedBy(),
      updatedBy: entity.getUpdatedBy(),
      audioMediaId: entity.getAudioMediaId(),
      imageMediaId: entity.getImageMediaId(),
      partNumber: entity.getPartNumber(),
      gapNumber: entity.getGapNumber(),
      writingTaskType: entity.getWritingTaskType(),
      speakingPrompt: entity.getSpeakingPrompt(),
      isGridIn: entity.getIsGridIn(),
      formatMetadata: entity.getFormatMetadata() as Prisma.InputJsonValue ?? null,
      passageGroupId: entity.getPassageGroupId(),
      blankNumber: entity.getBlankNumber(),
      subQuestionNumber: entity.getSubQuestionNumber(),
      passageTitle: entity.getPassageTitle(),
      passageType: entity.getPassageType(),
    };
    const saved = await this.prisma.examQuestion.upsert({
      where: { id: entity.id },
      create: { id: entity.id, ...data },
      update: data,
    });
    return mapExamQuestionToEntity(saved);
  }

  async deleteExamQuestion(examId: string, questionId: string): Promise<boolean> {
    const result = await this.prisma.examQuestion.deleteMany({ where: { examId, questionId } });
    return result.count > 0;
  }

  async deleteAllExamQuestionsByExamId(examId: string): Promise<void> {
    await this.prisma.examQuestion.deleteMany({ where: { examId } });
  }

  async countExamQuestionsByExamId(examId: string): Promise<number> {
    return this.prisma.examQuestion.count({ where: { examId } });
  }

  async countExamQuestionsBySectionId(examId: string, sectionId: string): Promise<number> {
    return this.prisma.examQuestion.count({ where: { examId, sectionId } });
  }

  async batchCountQuestionsBySectionIds(examId: string, sectionIds: string[]): Promise<Map<string, number>> {
    if (sectionIds.length === 0) return new Map();
    const rows = await this.prisma.examQuestion.groupBy({
      by: ['sectionId'],
      where: { examId, sectionId: { in: sectionIds } },
      _count: { id: true },
    });
    const map = new Map<string, number>();
    for (const row of rows) {
      if (row.sectionId) map.set(row.sectionId, row._count.id);
    }
    for (const sid of sectionIds) {
      if (!map.has(sid)) map.set(sid, 0);
    }
    return map;
  }
}
