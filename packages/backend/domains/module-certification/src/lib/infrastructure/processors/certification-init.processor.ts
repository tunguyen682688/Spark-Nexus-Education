import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';
import { ExamStrategyRegistry } from '../../domain/exam-strategies/exam-strategy.registry';
import { CertificationCacheService } from '../cache/certification-cache.service';

const PROGRESS_KEY_PREFIX = 'certification:init-progress:';
const PROGRESS_TTL = 3600;

interface InitProgress {
  questionsCreated: number;
  totalQuestions: number;
  percentage: number;
  currentSection: string;
  status: 'initializing' | 'completed' | 'failed';
  phase?: 'preparing' | 'collecting' | 'inserting' | 'finalizing';
  phaseLabel?: string;
}

@Processor('certification-init')
export class CertificationInitProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificationInitProcessor.name);

  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository,
    private readonly strategyRegistry: ExamStrategyRegistry,
    private readonly cacheService: CertificationCacheService,
  ) {
    super();
  }

  async process(job: Job<unknown>): Promise<void> {
    this.logger.log(`[Init] Processing job ${job.id} "${job.name}"`);

    switch (job.name) {
      case 'initialize-exam-questions':
        await this.handleInitializeExamQuestions(job as Job<{
          examId: string;
          userId: string;
          certificationType: string;
          sectionIds: Array<{ id: string; order: number }>;
        }>);
        break;
      case 'validate-exam-content':
        await this.handleValidateExamContent(job as Job<{
          examId: string;
          userId: string;
        }>);
        break;
      default:
        this.logger.warn(`[Init] Unknown job name: ${job.name}`);
        break;
    }
  }

  private async handleInitializeExamQuestions(job: Job<{
    examId: string;
    userId: string;
    certificationType: string;
    sectionIds: Array<{ id: string; order: number }>;
  }>): Promise<void> {
    const { examId, userId, certificationType, sectionIds } = job.data;
    const progressKey = `${PROGRESS_KEY_PREFIX}${examId}`;

    try {
      await this.repository.updateExamInitializationStatus(examId, 'initializing');
      this.logger.log(`[Init] Initializing ${certificationType} questions for exam ${examId}`);

      const strategy = this.strategyRegistry.get(certificationType);
      if (!strategy) {
        this.logger.warn(`[Init] No strategy for ${certificationType}, marking failed`);
        await this.repository.updateExamInitializationStatus(examId, 'failed');
        return;
      }

      const exam = await this.repository.findExamById(examId);
      if (!exam) {
        this.logger.warn(`[Init] Exam ${examId} no longer exists, aborting`);
        await this.repository.updateExamInitializationStatus(examId, 'failed');
        return;
      }

      const sectionMap = new Map<number, { id: string; order: number }>();
      for (const s of sectionIds) {
        const sectionExists = await this.repository.findSectionById(s.id);
        if (!sectionExists) {
          this.logger.warn(`[Init] Section ${s.id} (order=${s.order}) not found, aborting`);
          await this.repository.updateExamInitializationStatus(examId, 'failed');
          return;
        }
        sectionMap.set(s.order, s);
      }

      const structure = strategy.getStructure();

      const existing = await this.repository.findExamQuestionsByExamId(examId);
      if (existing.length > 0) {
        this.logger.log(`[Init] Exam ${examId} already has ${existing.length} questions, skipping`);
        await this.repository.updateExamInitializationStatus(examId, 'completed');
        return;
      }

      const totalSlots = structure.sections.reduce((sum, s) => sum + s.questionSlots.length, 0);

      await this.cacheService.set(progressKey, {
        questionsCreated: 0,
        totalQuestions: totalSlots,
        percentage: 0,
        currentSection: '',
        status: 'initializing',
        phase: 'preparing',
        phaseLabel: 'Đang kiểm tra dữ liệu...',
      } as InitProgress, PROGRESS_TTL);

      // Phase 1: Collect all question data in memory (no DB calls)
      this.logger.log(`[Init] Phase 1: Collecting ${totalSlots} questions...`);
      await this.cacheService.set(progressKey, {
        questionsCreated: 0,
        totalQuestions: totalSlots,
        percentage: 5,
        currentSection: '',
        status: 'initializing',
        phase: 'collecting',
        phaseLabel: `Đang tổng hợp ${totalSlots} câu hỏi...`,
      } as InitProgress, PROGRESS_TTL);
      const batchData: Array<{
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
          audioUrl: string | null;
          imageUrl: string | null;
          partNumber: number;
          formatMetadata: unknown | null;
          passageGroupId: string | null;
          passageType: string | null;
          passageTitle: string | null;
          blankNumber: number | null;
          subQuestionNumber: number | null;
        };
      }> = [];

      for (const sectionDef of structure.sections) {
        const sectionRef = sectionMap.get(sectionDef.order);
        if (!sectionRef) continue;

        for (let qIdx = 0; qIdx < sectionDef.questionSlots.length; qIdx++) {
          const slot = sectionDef.questionSlots[qIdx];
          const questionId = crypto.randomUUID();
          const defaults = strategy.createQuestionDefaults(slot);

          const questionChoices = defaults.options.map((opt, i) => ({
            id: crypto.randomUUID(),
            questionId,
            content: opt.content,
            isCorrect: opt.isCorrect,
            order: i,
            createdBy: userId,
            updatedBy: userId,
          }));

          const meta: typeof batchData[number]['metadata'] = {
            id: crypto.randomUUID(),
            questionId,
            explanation: null,
            points: slot.points,
            estimatedTime: slot.estimatedTime ? String(slot.estimatedTime) : null,
            shuffleOptions: false,
            modelAnswer: null,
            rubric: null,
            passageText: null,
            qualityScore: null,
          };

          batchData.push({
            question: {
              id: questionId,
              content: defaults.content,
              type: slot.questionType,
              difficulty: 'Medium',
              category: null,
              status: 'draft',
              createdBy: userId,
              updatedBy: userId,
            },
            choices: questionChoices,
            metadata: meta,
            examQuestion: {
              id: crypto.randomUUID(),
              examId,
              questionId,
              sectionId: sectionRef.id,
              order: qIdx,
              points: slot.points,
              createdBy: userId,
              updatedBy: userId,
              audioUrl: null,
              imageUrl: null,
              partNumber: sectionDef.order,
              formatMetadata: null,
              passageGroupId: slot.passageGroupId ?? null,
              passageType: slot.passageType ?? null,
              passageTitle: null,
              blankNumber: null,
              subQuestionNumber: null,
            },
          });
        }
      }

      this.logger.log(`[Init] Phase 1 complete: ${batchData.length} questions collected`);

      // Phase 2: Batch insert all questions in a single transaction
      this.logger.log(`[Init] Phase 2: Batch inserting ${batchData.length} questions...`);
      await this.cacheService.set(progressKey, {
        questionsCreated: 0,
        totalQuestions: totalSlots,
        percentage: 30,
        currentSection: '',
        status: 'initializing',
        phase: 'inserting',
        phaseLabel: `Đang lưu ${batchData.length} câu hỏi vào database...`,
      } as InitProgress, PROGRESS_TTL);

      const created = await this.repository.batchInitializeExamQuestions({
        examId,
        userId,
        questions: batchData,
      });

      this.logger.log(`[Init] Phase 2 complete: ${created} questions inserted`);

      // Phase 3: Update section counts and exam totals
      this.logger.log(`[Init] Phase 3: Updating section counts...`);
      await this.cacheService.set(progressKey, {
        questionsCreated: created,
        totalQuestions: totalSlots,
        percentage: 85,
        currentSection: '',
        status: 'initializing',
        phase: 'finalizing',
        phaseLabel: 'Đang cập nhật số lượng câu hỏi...',
      } as InitProgress, PROGRESS_TTL);
      for (const sectionDef of structure.sections) {
        const sectionRef = sectionMap.get(sectionDef.order);
        if (!sectionRef) continue;

        const sectionEntity = await this.repository.findSectionById(sectionRef.id);
        if (sectionEntity) {
          sectionEntity.update({ questionCount: sectionDef.questionSlots.length });
          await this.repository.saveExamSection(sectionEntity);
        }
      }

      exam.update({ totalQuestions: created });
      await this.repository.saveExam(exam);

      await this.repository.updateExamInitializationStatus(examId, 'completed');

      // Invalidate exam cache so next read gets fresh data
      await this.cacheService.delete(`certification:exams:${examId}`);

      // Write final progress with short TTL — frontend reads this before transitioning
      await this.cacheService.set(progressKey, {
        questionsCreated: created,
        totalQuestions: totalSlots,
        percentage: 100,
        currentSection: 'Done',
        status: 'completed',
        phase: 'finalizing',
        phaseLabel: 'Hoàn tất!',
      } as InitProgress, 30);

      await job.updateProgress(100);
      this.logger.log(`[Init] Exam ${examId} initialized: ${created} questions`);
    } catch (error) {
      this.logger.error(`[Init] Failed to initialize questions for exam ${examId}`, error);

      // Write failure progress with short TTL
      await this.cacheService.set(progressKey, {
        questionsCreated: 0,
        totalQuestions: 0,
        percentage: 0,
        currentSection: '',
        status: 'failed',
        phase: 'preparing',
        phaseLabel: 'Thất bại!',
      } as InitProgress, 60);

      try {
        await this.repository.deleteAllExamQuestionsByExamId(examId);
      } catch (cleanupError) {
        this.logger.error(`[Init] ExamQuestion cleanup failed for exam ${examId}`, cleanupError);
      }

      await this.repository.updateExamInitializationStatus(examId, 'failed');
    }
  }

  private async handleValidateExamContent(job: Job<{
    examId: string;
    userId: string;
  }>): Promise<void> {
    const { examId } = job.data;
    this.logger.log(`[Init] Validating content for exam ${examId}`);

    const exam = await this.repository.findExamById(examId);
    if (!exam) {
      throw new Error(`Exam ${examId} not found`);
    }

    const sections = await this.repository.findSectionsByExamId(examId);
    const issues: string[] = [];

    for (const section of sections) {
      const questions = await this.repository.findExamQuestionsByExamIdAndSectionId(examId, section.id);
      if (questions.length === 0) {
        issues.push(`Section "${section.getTitle()}" (order=${section.getOrder()}) has no questions`);
      }
    }

    const examQuestions = await this.repository.findExamQuestionsByExamId(examId);
    if (examQuestions.length === 0) {
      issues.push('Exam has no questions at all');
    }

    if (issues.length > 0) {
      this.logger.warn(`[Init] Exam ${examId} validation issues: ${issues.join('; ')}`);
      throw new Error(`Validation failed: ${issues.join('; ')}`);
    }

    this.logger.log(`[Init] Exam ${examId} validation passed (${examQuestions.length} questions across ${sections.length} sections)`);
    await job.updateProgress(100);
  }
}
