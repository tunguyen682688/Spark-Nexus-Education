import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { randomUUID } from 'crypto';
import type { ICertificationRepository } from '../../domain/repositories/certification.repository.interface';
import { CERTIFICATION_REPOSITORY } from '../../domain/repositories/certification.repository.interface';
import type { CertificationCacheService } from '../cache/certification-cache.service';
import { PatchExamContentDto, PatchExamContentSectionDto } from '../../application/dtos/save-exam-content.dto';
import { ExamSectionEntity } from '../../domain/entities/exam-section.entity';

interface EditJobData {
  examId: string;
  userId: string;
  payloadKey: string;
  expectedVersion: number;
}

interface EditJobResult {
  sectionsUpdated: number;
  questionsUpdated: number;
}

@Processor('certification-edit')
export class CertificationEditProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificationEditProcessor.name);

  constructor(
    @Inject(CERTIFICATION_REPOSITORY)
    private readonly repo: ICertificationRepository,
    @Inject('CertificationCacheService')
    private readonly cacheService: CertificationCacheService,
  ) {
    super();
  }

  async process(job: Job<EditJobData>): Promise<EditJobResult> {
    const { examId, userId, payloadKey, expectedVersion } = job.data;
    this.logger.log(`[Edit] Processing content save for exam ${examId}, job ${job.id}`);

    // 1. Retrieve full DTO from Redis (stored by handler with 5min TTL)
    const dto = await this.cacheService.get<PatchExamContentDto>(payloadKey);
    if (!dto) {
      throw new Error(`Payload expired or not found for key ${payloadKey}`);
    }
    // Clean up the temp key
    await this.cacheService.delete(payloadKey).catch(() => {});

    // 1. Optimistic lock check
    const exam = await this.repo.findExamById(examId);
    if (!exam) {
      throw new Error(`Exam ${examId} not found`);
    }
    if (Number(exam.version) !== expectedVersion) {
      throw new Error(
        `Conflict: exam version mismatch (expected ${expectedVersion}, got ${Number(exam.version)})`
      );
    }

    const sections = dto.sections ?? [];
    let totalUpdated = 0;

    // 2. Update exam-level settings if provided
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

    // 3. Per-section dirty question upsert
    for (const sectionDto of sections) {
      const count = await this.patchSection(examId, userId, sectionDto);
      totalUpdated += count;
      await job.updateProgress({ phase: 'questions', processed: totalUpdated });
    }

    // 4. Update section metadata
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

    // 5. Delete removed questions
    if (dto.removedQuestionIds && dto.removedQuestionIds.length > 0) {
      await this.repo.deleteExamQuestionsByIds(examId, dto.removedQuestionIds);
    }

    // 6. Update total question count + section counts
    const hasQuestionChanges = sections.length > 0 || (dto.removedQuestionIds && dto.removedQuestionIds.length > 0);
    if (hasQuestionChanges) {
      const totalQuestions = await this.repo.countExamQuestionsByExamId(examId);
      exam.update({ totalQuestions });
      await this.repo.saveExam(exam);

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

    this.logger.log(`[Edit] Content save completed for exam ${examId}: ${totalUpdated} questions`);
    return { sectionsUpdated: sections.length, questionsUpdated: totalUpdated };
  }

  /**
   * Question-level differential section save (same logic as handler.patchSection).
   */
  private async patchSection(
    examId: string,
    userId: string,
    sectionDto: PatchExamContentSectionDto
  ): Promise<number> {
    const sectionId = sectionDto.id;
    if (!sectionId) {
      this.logger.warn('[Edit] Skipping section without id');
      return 0;
    }

    const existingLinks = await this.repo.findExamQuestionsByExamIdAndSectionId(examId, sectionId);
    const existingByQuestionId = new Map<string, { linkId: string; questionId: string; order: number }>();
    for (const link of existingLinks) {
      existingByQuestionId.set(link.getQuestionId(), {
        linkId: link.id,
        questionId: link.getQuestionId(),
        order: link.getOrder(),
      });
    }

    const existingSection = await this.repo.findSectionById(sectionId);
    const tempIdMap = new Map<string, string>();

    const batchQuestions = sectionDto.questions.map((questionDto, i) => {
      const incomingId = questionDto.id;
      const isTempId = incomingId ? incomingId.startsWith('temp-') || incomingId.startsWith('tmpl-') : false;
      let questionId: string;
      let existingLinkId: string | undefined;

      if (isTempId) {
        questionId = randomUUID();
        tempIdMap.set(incomingId!, questionId);
      } else if (incomingId) {
        const existing = existingByQuestionId.get(incomingId);
        if (existing?.questionId) {
          questionId = existing.questionId;
          existingLinkId = existing.linkId;
        } else {
          questionId = incomingId;
        }
      } else {
        questionId = randomUUID();
      }

      const existing = isTempId || !incomingId ? undefined : existingByQuestionId.get(incomingId);

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
        order: existing?.order ?? i,
        linkId: existingLinkId,
      };
    });

    return this.repo.batchUpsertQuestionsForPatch({
      examId,
      userId,
      questions: batchQuestions,
    });
  }
}
