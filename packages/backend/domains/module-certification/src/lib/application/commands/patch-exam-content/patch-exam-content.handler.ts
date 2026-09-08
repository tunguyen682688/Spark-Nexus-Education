import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  ICertificationRepository,
} from '../../../domain/repositories/certification.repository.interface';
import { CERTIFICATION_REPOSITORY } from '../../../domain/repositories/certification.repository.interface';
import {
  PatchExamContentCommand,
  PatchExamContentResult,
} from './patch-exam-content.command';
import { ExamSectionEntity } from '../../../domain/entities/exam-section.entity';
import { PatchExamContentSectionDto } from '../../dtos/save-exam-content.dto';

@CommandHandler(PatchExamContentCommand)
export class PatchExamContentHandler
  implements ICommandHandler<PatchExamContentCommand, PatchExamContentResult>
{
  private readonly logger = new Logger(PatchExamContentHandler.name);

  constructor(
    @Inject(CERTIFICATION_REPOSITORY)
    private readonly repo: ICertificationRepository
  ) {}

  async execute(command: PatchExamContentCommand): Promise<PatchExamContentResult> {
    const { examId, userId, dto } = command;
    const sections = dto.sections ?? [];

    this.logger.log(`Patching exam content for ${examId}: ${sections.length} dirty sections, ${dto.removedQuestionIds?.length || 0} removed`);

    // Fetch exam ONCE — cache for all subsequent operations
    const exam = await this.repo.findExamById(examId);
    if (!exam) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }

    // Ownership check
    const collection = await this.repo.findCollectionById(exam.getCollectionId());
    if (!collection || collection.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only edit your own exams');
    }

    let totalUpdated = 0;
    const allTempIdMaps = new Map<string, string>();

    await this.repo.withTransaction(async () => {
      // 1. Update exam-level settings if provided
      const settings = dto.examSettings;
      const hasSettings = settings
        || dto.title || dto.description || dto.level || dto.duration !== undefined
        || dto.passScore !== undefined || dto.maxScore !== undefined
        || dto.examType || dto.certificationType || dto.publishStatus;
      if (hasSettings) {
        exam.update({
          ...(settings?.title !== undefined && { title: settings.title }),
          ...(dto.title !== undefined && { title: dto.title }),
          ...(settings?.description !== undefined && { description: settings.description }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(settings?.level !== undefined && { level: settings.level }),
          ...(dto.level !== undefined && { level: dto.level }),
          ...(settings?.duration !== undefined && { duration: settings.duration }),
          ...(dto.duration !== undefined && { duration: dto.duration }),
          ...(settings?.passScore !== undefined && { passScore: settings.passScore }),
          ...(dto.passScore !== undefined && { passScore: dto.passScore }),
          ...(settings?.maxScore !== undefined && { maxScore: settings.maxScore }),
          ...(dto.maxScore !== undefined && { maxScore: dto.maxScore }),
          ...(settings?.examType !== undefined && { examType: settings.examType }),
          ...(dto.examType !== undefined && { examType: dto.examType }),
          ...(settings?.certificationType !== undefined && { certificationType: settings.certificationType }),
          ...(dto.certificationType !== undefined && { certificationType: dto.certificationType }),
          ...(settings?.publishStatus !== undefined && { publishStatus: settings.publishStatus }),
          ...(dto.publishStatus !== undefined && { publishStatus: dto.publishStatus }),
        });
        await this.repo.saveExam(exam);
      }

      // 2. Upsert ONLY dirty questions per section
      for (const sectionDto of sections) {
        const { count, tempIdMap } = await this.patchSection(examId, userId, sectionDto);
        totalUpdated += count;
        for (const [tempId, realId] of tempIdMap) {
          allTempIdMaps.set(tempId, realId);
        }
      }

      // 3. Update section metadata if provided
      if (dto.sectionMetadata && dto.sectionMetadata.length > 0) {
        for (const meta of dto.sectionMetadata) {
          const existing = await this.repo.findSectionById(meta.id);
          if (!existing) continue;

          const section = ExamSectionEntity.create({
            id: meta.id,
            examId,
            title: meta.title ?? existing.getTitle(),
            subtitle: meta.subtitle ?? existing.getSubtitle(),
            sectionType: existing.getSectionType(),
            instruction: meta.instruction ?? existing.getInstruction(),
            order: meta.order ?? existing.getOrder(),
            durationMinutes: meta.durationMinutes ?? existing.getDurationMinutes(),
            questionCount: existing.getQuestionCount(),
            isBreak: existing.getIsBreak(),
            audioUrl: existing.getAudioUrl(),
            scriptText: existing.getScriptText(),
            passageText: existing.getPassageText(),
            passageTitle: existing.getPassageTitle(),
            passageType: existing.getPassageType(),
          });
          await this.repo.saveExamSection(section);
        }
      }

      // 4. Delete removed questions
      if (dto.removedQuestionIds && dto.removedQuestionIds.length > 0) {
        await this.repo.deleteExamQuestionsByIds(examId, dto.removedQuestionIds);
      }

      // 5. Update total question count + section counts only if questions or deletions occurred
      const hasQuestionChanges = sections.length > 0 || (dto.removedQuestionIds && dto.removedQuestionIds.length > 0);
      if (hasQuestionChanges) {
        const totalQuestions = await this.repo.countExamQuestionsByExamId(examId);
        exam.update({ totalQuestions });
        await this.repo.saveExam(exam);

        // Batch-fetch all affected section counts in ONE query
        const affectedSectionIds = new Set<string>([
          ...sections.map(s => s.id).filter((id): id is string => Boolean(id)),
          ...(dto.sectionMetadata || []).map(s => s.id),
        ]);
        if (affectedSectionIds.size > 0) {
          const sectionCounts = await this.repo.batchCountQuestionsBySectionIds(
            examId,
            Array.from(affectedSectionIds)
          );
          for (const [sectionId, count] of sectionCounts) {
            const section = await this.repo.findSectionById(sectionId);
            if (section) {
              section.update({ questionCount: count });
              await this.repo.saveExamSection(section);
            }
          }
        }
      }
    });

    this.logger.log(
      `Exam ${examId} patched: ${sections.length} sections, ${totalUpdated} questions updated`
    );

    return {
      examId,
      sectionsUpdated: sections.length,
      questionsUpdated: totalUpdated,
      tempIdMap: Object.fromEntries(allTempIdMaps),
    };
  }

  /**
   * Question-level differential section save.
   * Uses questionId-based matching (not order-based) for safe reordering.
   */
  private async patchSection(
    examId: string,
    userId: string,
    sectionDto: PatchExamContentSectionDto
  ): Promise<{ count: number; tempIdMap: Map<string, string> }> {
    const sectionId = sectionDto.id;
    if (!sectionId) {
      this.logger.warn('Skipping section without id in PATCH payload');
      return { count: 0, tempIdMap: new Map() };
    }

    // Fetch existing links indexed by questionId (not order)
    const existingLinks = await this.repo.findExamQuestionsByExamIdAndSectionId(examId, sectionId);
    const existingByQuestionId = new Map<string, { linkId: string; questionId: string }>();
    for (const link of existingLinks) {
      existingByQuestionId.set(link.getQuestionId(), {
        linkId: link.id,
        questionId: link.getQuestionId(),
      });
    }

    const existingSection = await this.repo.findSectionById(sectionId);
    const tempIdMap = new Map<string, string>();

    // Build batch with questionId-based matching
    const batchQuestions = sectionDto.questions.map((questionDto, i) => {
      const incomingId = questionDto.id;
      const isTempId = incomingId ? incomingId.startsWith('temp-') || incomingId.startsWith('tmpl-') : false;
      let questionId: string;
      let existingLinkId: string | undefined;

      if (isTempId) {
        // New question with temp ID — generate real UUID, map back
        questionId = randomUUID();
        tempIdMap.set(incomingId!, questionId);
      } else if (incomingId) {
        // Has a real ID — check if it exists in this section
        const existing = existingByQuestionId.get(incomingId);
        if (existing?.questionId) {
          questionId = existing.questionId;
          existingLinkId = existing.linkId;
        } else {
          // Real ID but not in this section — could be cross-section move or new
          questionId = incomingId;
        }
      } else {
        // No ID at all — generate new UUID
        questionId = randomUUID();
      }

      return {
        questionId,
        questionText: questionDto.questionText,
        questionType: questionDto.questionType,
        difficulty: questionDto.difficulty,
        points: questionDto.points,
        options: questionDto.options.map((o) => ({
          id: o.id && !o.id.startsWith('temp-') ? o.id : randomUUID(),
          text: o.text,
          isCorrect: o.isCorrect,
          label: o.label,
        })),
        explanation: questionDto.explanation,
        modelAnswer: questionDto.modelAnswer,
        rubric: questionDto.rubric as string | undefined,
        estimatedTime: questionDto.estimatedTime,
        audioUrl: questionDto.audioUrl,
        imageUrl: questionDto.imageUrl,
        passageGroupId: questionDto.passageGroupId,
        passageText: questionDto.passageText,
        passageType: questionDto.passageType,
        passageTitle: questionDto.passageTitle,
        blankNumber: questionDto.blankNumber,
        subQuestionNumber: questionDto.subQuestionNumber,
        formatMetadata: questionDto.formatMetadata,
        sectionId,
        sectionOrder: existingSection?.getOrder() ?? 0,
        order: i,
        linkId: existingLinkId,
      };
    });

    const count = await this.repo.batchUpsertQuestionsForPatch({
      examId,
      userId,
      questions: batchQuestions,
    });

    return { count, tempIdMap };
  }
}
