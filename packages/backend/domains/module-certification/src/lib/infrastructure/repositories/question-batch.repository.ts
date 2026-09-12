import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import {
  TX_TIMEOUT_DEFAULT,
  TX_TIMEOUT_MEDIUM,
  TX_TIMEOUT_SHORT,
} from '../../certification.constants';

@Injectable()
export class QuestionBatchRepository {
  private readonly logger = new Logger(QuestionBatchRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn, TX_TIMEOUT_DEFAULT);
  }

  async upsertChoicesDifferential(
    questionId: string,
    newChoices: Array<{ text: string; isCorrect: boolean; order: number }>,
    userId: string,
  ): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      await this.upsertChoicesDifferentialWithTx(tx, questionId, newChoices, userId);
    }, TX_TIMEOUT_SHORT);
  }

  async batchUpsertQuestionsForPatch(params: {
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
    const { examId, userId, questions } = params;
    if (questions.length === 0) return 0;

    const questionsWithHash = questions.map(q => ({
      ...q,
      _hash: this.computeQuestionHash(q),
    }));
    const allQuestionIds = questionsWithHash.map(q => q.questionId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const [existingLinks, existingMetadata] = await Promise.all([
          tx.examQuestion.findMany({
            where: { examId, questionId: { in: allQuestionIds } },
          }),
          tx.questionMetadata.findMany({
            where: { questionId: { in: allQuestionIds } },
          }),
        ]);
        const existingLinkMap = new Map(existingLinks.map(l => [l.questionId, l]));
        const existingMetadataSet = new Set(existingMetadata.map(m => m.questionId));

        const changedQuestions = questionsWithHash.filter(q => {
          const existing = existingLinkMap.get(q.questionId);
          return !existing || existing.contentHash !== q._hash;
        });
        if (changedQuestions.length === 0) {
          this.logger.debug(`All ${questionsWithHash.length} questions unchanged (hash match), skipping DB writes`);
          return 0;
        }

        await this.chunkedParallel(changedQuestions, 20, (chunk) =>
          Promise.all(chunk.map(q => {
            const title = q.questionText?.substring(0, 255) || '';
            return tx.question.upsert({
              where: { id: q.questionId },
              create: {
                id: q.questionId,
                title,
                content: q.questionText,
                type: q.questionType,
                difficulty: q.difficulty,
                status: 'draft',
                createdBy: userId,
                updatedBy: userId,
              },
              update: {
                title,
                content: q.questionText,
                type: q.questionType,
                difficulty: q.difficulty,
                updatedBy: userId,
              },
            });
          }))
        );

        await this.chunkedParallel(changedQuestions, 20, (chunk) =>
          Promise.all(chunk.map(q =>
            this.upsertChoicesDifferentialWithTx(tx, q.questionId, q.options.map((o, i) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              order: i,
            })), userId)
          ))
        );

        await this.chunkedParallel(changedQuestions, 20, (chunk) =>
          Promise.all(chunk.map(q => {
            const isNew = !existingMetadataSet.has(q.questionId);
            const mdData = {
              explanation: q.explanation || null,
              points: q.points,
              estimatedTime: q.estimatedTime ? String(q.estimatedTime) : null,
              modelAnswer: q.modelAnswer || null,
              rubric: (q.rubric ?? undefined) as Prisma.InputJsonValue | undefined,
              passageText: q.passageText || null,
            };
            if (isNew) {
              return tx.questionMetadata.create({
                data: { id: crypto.randomUUID(), questionId: q.questionId, shuffleOptions: false, ...mdData },
              });
            }
            return tx.questionMetadata.update({
              where: { questionId: q.questionId },
              data: mdData,
            });
          }))
        );

        await this.chunkedParallel(changedQuestions, 20, (chunk) =>
          Promise.all(chunk.map(q => {
            const existing = existingLinkMap.get(q.questionId);
            const linkId = existing?.id || q.linkId || crypto.randomUUID();
            const data = {
              examId,
              questionId: q.questionId,
              sectionId: q.sectionId,
              order: q.order,
              points: q.points,
              audioMediaId: q.audioMediaId ?? null,
              imageMediaId: q.imageMediaId ?? null,
              partNumber: q.sectionOrder,
              formatMetadata: (q.formatMetadata ?? undefined) as Prisma.InputJsonValue | undefined,
              passageGroupId: q.passageGroupId ?? null,
              passageType: q.passageType ?? null,
              passageTitle: q.passageTitle ?? null,
              blankNumber: q.blankNumber ?? null,
              subQuestionNumber: q.subQuestionNumber ?? null,
              contentHash: q._hash,
            };
            if (existing) {
              return tx.examQuestion.update({ where: { id: linkId }, data: { ...data, updatedBy: userId } });
            }
            return tx.examQuestion.create({
              data: { ...data, id: linkId, createdBy: userId, updatedBy: userId },
            });
          }))
        );

        return changedQuestions.length;
      }, TX_TIMEOUT_MEDIUM);
    } catch (error) {
      const err = error as Error & { code?: string; meta?: unknown };
      this.logger.error(`batchUpsertQuestionsForPatch FAILED: ${err.message}`, err.stack);
      if (err.code) {
        this.logger.error(`Prisma error code: ${err.code}, meta: ${JSON.stringify(err.meta)}`);
      }
      throw error;
    }
  }

  async batchInitializeExamQuestions(params: {
    examId: string;
    userId: string;
    questions: Array<{
      question: {
        id: string; content: string; type: string; difficulty: string;
        category: string | null; status: string; createdBy: string; updatedBy: string;
      };
      choices: Array<{
        id: string; questionId: string; content: string; isCorrect: boolean;
        order: number; createdBy: string; updatedBy: string;
      }>;
      metadata: {
        id: string; questionId: string; explanation: string | null; points: number;
        estimatedTime: string | null; shuffleOptions: boolean;
        modelAnswer: string | null; rubric: unknown | null;
        passageText: string | null; qualityScore: number | null;
      };
      examQuestion: {
        id: string; examId: string; questionId: string; sectionId: string;
        order: number; points: number; createdBy: string; updatedBy: string;
        audioMediaId: string | null; imageMediaId: string | null; partNumber: number;
        formatMetadata: unknown | null; passageGroupId: string | null;
        passageType: string | null; passageTitle: string | null;
        blankNumber: number | null; subQuestionNumber: number | null;
      };
    }>;
  }): Promise<number> {
    if (params.questions.length === 0) return 0;

    await this.prisma.$transaction(async (tx) => {
      await tx.question.createMany({
        data: params.questions.map(q => ({
          id: q.question.id,
          title: q.question.content,
          content: q.question.content,
          type: q.question.type,
          difficulty: q.question.difficulty,
          category: q.question.category,
          status: q.question.status,
          createdBy: q.question.createdBy,
          updatedBy: q.question.updatedBy,
        })),
      });

      const allChoices = params.questions.flatMap(q =>
        q.choices.map(c => ({
          id: c.id, questionId: c.questionId, content: c.content,
          isCorrect: c.isCorrect, order: c.order,
          createdBy: c.createdBy, updatedBy: c.updatedBy,
        }))
      );
      if (allChoices.length > 0) {
        await tx.questionChoice.createMany({ data: allChoices });
      }

      await tx.questionMetadata.createMany({
        data: params.questions.map(q => ({
          id: q.metadata.id, questionId: q.metadata.questionId,
          explanation: q.metadata.explanation, points: q.metadata.points,
          estimatedTime: q.metadata.estimatedTime, shuffleOptions: q.metadata.shuffleOptions,
          modelAnswer: q.metadata.modelAnswer,
          rubric: (q.metadata.rubric ?? undefined) as Prisma.InputJsonValue | undefined,
          passageText: q.metadata.passageText, qualityScore: q.metadata.qualityScore,
        })),
      });

      await tx.questionVersion.createMany({
        data: params.questions.map(q => ({
          questionId: q.question.id, version: 1,
          content: JSON.stringify({
            title: q.question.content, content: q.question.content,
            type: q.question.type, difficulty: q.question.difficulty,
            choices: q.choices.map(c => ({
              id: c.id, content: c.content, isCorrect: c.isCorrect, order: c.order,
            })),
            metadata: q.metadata,
          }),
          createdBy: q.question.updatedBy || q.question.createdBy,
        })),
      });

      await tx.examQuestion.createMany({
        data: params.questions.map(q => ({
          id: q.examQuestion.id, examId: q.examQuestion.examId,
          questionId: q.examQuestion.questionId, sectionId: q.examQuestion.sectionId,
          order: q.examQuestion.order, points: q.examQuestion.points,
          createdBy: q.examQuestion.createdBy, updatedBy: q.examQuestion.updatedBy,
          audioMediaId: q.examQuestion.audioMediaId, imageMediaId: q.examQuestion.imageMediaId,
          partNumber: q.examQuestion.partNumber,
          formatMetadata: (q.examQuestion.formatMetadata ?? undefined) as Prisma.InputJsonValue | undefined,
          passageGroupId: q.examQuestion.passageGroupId, passageType: q.examQuestion.passageType,
          passageTitle: q.examQuestion.passageTitle, blankNumber: q.examQuestion.blankNumber,
          subQuestionNumber: q.examQuestion.subQuestionNumber,
        })),
      });
    }, TX_TIMEOUT_DEFAULT);

    return params.questions.length;
  }

  private async chunkedParallel<T>(
    items: T[],
    chunkSize: number,
    handler: (chunk: T[]) => Promise<unknown>,
  ): Promise<void> {
    for (let i = 0; i < items.length; i += chunkSize) {
      await handler(items.slice(i, i + chunkSize));
    }
  }

  private async upsertChoicesDifferentialWithTx(
    tx: Prisma.TransactionClient,
    questionId: string,
    newChoices: Array<{ text: string; isCorrect: boolean; order: number }>,
    userId: string,
  ): Promise<void> {
    const existing = await tx.questionChoice.findMany({
      where: { questionId },
      orderBy: { order: 'asc' },
    });

    const toDelete: string[] = [];
    const toUpdate: Array<{ id: string; data: Prisma.QuestionChoiceUpdateInput }> = [];
    const toCreate: Prisma.QuestionChoiceCreateManyInput[] = [];

    const maxLen = Math.max(existing.length, newChoices.length);
    for (let i = 0; i < maxLen; i++) {
      const old = existing[i];
      const nu = newChoices[i];

      if (!old && nu) {
        toCreate.push({
          questionId, content: nu.text, isCorrect: nu.isCorrect,
          order: i, createdBy: userId, updatedBy: userId,
        });
      } else if (old && !nu) {
        toDelete.push(old.id);
      } else if (old && nu && (old.content !== nu.text || old.isCorrect !== nu.isCorrect)) {
        toUpdate.push({
          id: old.id,
          data: { content: nu.text, isCorrect: nu.isCorrect, order: i, updatedBy: userId },
        });
      }
    }

    if (toDelete.length > 0) {
      await tx.questionChoice.deleteMany({ where: { id: { in: toDelete } } });
    }
    if (toUpdate.length > 0) {
      await Promise.all(toUpdate.map(u =>
        tx.questionChoice.update({ where: { id: u.id }, data: u.data })
      ));
    }
    if (toCreate.length > 0) {
      await tx.questionChoice.createMany({ data: toCreate });
    }
  }

  private computeQuestionHash(q: {
    questionText: string; questionType: string; difficulty: string; points: number;
    options: Array<{ text: string; isCorrect: boolean; label?: string }>;
    explanation?: string; modelAnswer?: string; rubric?: string; estimatedTime?: number;
    audioMediaId?: string; imageMediaId?: string; passageGroupId?: string;
    passageText?: string; passageType?: string; passageTitle?: string;
    blankNumber?: number; subQuestionNumber?: number;
    formatMetadata?: Record<string, unknown>; detailedExplanation?: string;
  }): string {
    const data = JSON.stringify({
      t: q.questionType, txt: q.questionText, d: q.difficulty, p: q.points,
      o: q.options.map(o => ({ l: o.label, t: o.text, c: o.isCorrect })),
      e: q.explanation, m: q.modelAnswer, de: q.detailedExplanation,
      r: q.rubric, et: q.estimatedTime, au: q.audioMediaId, im: q.imageMediaId,
      pg: q.passageGroupId, pt: q.passageText, pp: q.passageType, ppo: q.passageTitle,
      bi: q.blankNumber, sq: q.subQuestionNumber, fm: q.formatMetadata,
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
