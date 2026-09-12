import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { Prisma } from '@prisma/client';
import { QuestionEntity } from '../../domain/entities/question.entity';
import { QuestionChoiceEntity } from '../../domain/entities/question-choice.entity';
import { QuestionMetadataEntity } from '../../domain/entities/question-metadata.entity';
import { mapQuestionToEntity, mapChoiceToEntity, mapMetadataToEntity, mapExamQuestionToEntity } from './mappers';

@Injectable()
export class QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findQuestionById(id: string): Promise<QuestionEntity | null> {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: { choices: true },
    });
    if (!question) return null;
    return mapQuestionToEntity(question);
  }

  async findQuestionsByIds(ids: string[]): Promise<QuestionEntity[]> {
    if (ids.length === 0) return [];
    const questions = await this.prisma.question.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
    return questions.map((q) => mapQuestionToEntity(q));
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
      create: { id: question.id, ...data },
      update: data,
    });
    return mapQuestionToEntity(saved);
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.prisma.question.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findQuestionWithBuilderData(id: string) {
    const question = await this.prisma.question.findFirst({
      where: { id, deletedAt: null },
      include: {
        choices: { orderBy: { order: 'asc' } },
        metadata: true,
      },
    });
    if (!question) return null;
    const examQuestionRecords = await this.prisma.examQuestion.findMany({
      where: { questionId: id },
      orderBy: { createdAt: 'desc' },
    });
    return {
      question: mapQuestionToEntity(question),
      choices: question.choices.map((c) => mapChoiceToEntity(c)),
      metadata: question.metadata ? mapMetadataToEntity(question.metadata) : null,
      examQuestions: examQuestionRecords.map((eq) => mapExamQuestionToEntity(eq)),
    };
  }

  async saveQuestionWithChoices(
    question: QuestionEntity,
    choices: QuestionChoiceEntity[],
    metadata: QuestionMetadataEntity | null
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.question.upsert({
        where: { id: question.id },
        create: {
          id: question.id,
          title: question.getTitle(),
          content: question.getContent(),
          type: question.getType(),
          difficulty: question.getDifficulty(),
          category: question.getCategory(),
          status: question.getStatus(),
          createdBy: question.getCreatedBy(),
          updatedBy: question.getUpdatedBy(),
        },
        update: {
          title: question.getTitle(),
          content: question.getContent(),
          type: question.getType(),
          difficulty: question.getDifficulty(),
          category: question.getCategory(),
          status: question.getStatus(),
          updatedBy: question.getUpdatedBy(),
        },
      });
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
      if (metadata) {
        const mdCreate = {
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
          passageId: metadata.getPassageId(),
          passageText: metadata.getPassageText(),
          modelAnswer: metadata.getModelAnswer(),
          rubric: metadata.getRubric() as Prisma.InputJsonValue ?? null,
          matchingPairs: metadata.getMatchingPairs() as Prisma.InputJsonValue ?? null,
          wordRoot: metadata.getWordRoot(),
          keyWord: metadata.getKeyWord(),
          media: metadata.getMedia() as Prisma.InputJsonValue ?? null,
          hints: metadata.getHints() as Prisma.InputJsonValue ?? null,
        };
        await tx.questionMetadata.upsert({
          where: { questionId: question.id },
          create: mdCreate,
          update: mdCreate,
        });
      }
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
      await tx.examQuestion.deleteMany({ where: { questionId: id } });
      await tx.questionChoice.deleteMany({ where: { questionId: id } });
      await tx.questionMetadata.deleteMany({ where: { questionId: id } });
      await tx.questionVersion.deleteMany({ where: { questionId: id } });
      await tx.question.delete({ where: { id } });
    });
  }

  async findMetadataByQuestionId(questionId: string): Promise<QuestionMetadataEntity | null> {
    const metadata = await this.prisma.questionMetadata.findUnique({ where: { questionId } });
    if (!metadata) return null;
    return mapMetadataToEntity(metadata);
  }

  async saveQuestionMetadata(metadata: QuestionMetadataEntity): Promise<QuestionMetadataEntity> {
    const data = {
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
      passageId: metadata.getPassageId(),
      passageText: metadata.getPassageText(),
      modelAnswer: metadata.getModelAnswer(),
      rubric: metadata.getRubric() as Prisma.InputJsonValue ?? null,
      matchingPairs: metadata.getMatchingPairs() as Prisma.InputJsonValue ?? null,
      wordRoot: metadata.getWordRoot(),
      keyWord: metadata.getKeyWord(),
      media: metadata.getMedia() as Prisma.InputJsonValue ?? null,
      hints: metadata.getHints() as Prisma.InputJsonValue ?? null,
    };
    const saved = await this.prisma.questionMetadata.upsert({
      where: { questionId: metadata.getQuestionId() },
      create: { id: metadata.id, questionId: metadata.getQuestionId(), ...data },
      update: data,
    });
    return mapMetadataToEntity(saved);
  }

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
      create: { id: choice.id, ...data },
      update: data,
    });
    return mapChoiceToEntity(saved);
  }

  async deleteQuestionChoice(id: string): Promise<void> {
    await this.prisma.questionChoice.delete({ where: { id } });
  }

  async findChoicesByQuestionId(questionId: string): Promise<QuestionChoiceEntity[]> {
    const choices = await this.prisma.questionChoice.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });
    return choices.map((c) => mapChoiceToEntity(c));
  }

  async deleteQuestionsByIds(questionIds: string[]): Promise<void> {
    if (questionIds.length === 0) return;
    await this.prisma.$transaction(async (tx) => {
      await tx.questionChoice.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.questionMetadata.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.questionVersion.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.examQuestion.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.question.deleteMany({ where: { id: { in: questionIds } } });
    });
  }
}
