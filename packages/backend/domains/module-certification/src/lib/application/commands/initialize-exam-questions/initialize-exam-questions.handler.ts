import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICertificationRepository } from '../../../domain/repositories/certification.repository.interface';
import { CERTIFICATION_REPOSITORY } from '../../../domain/repositories/certification.repository.interface';
import {
  InitializeExamQuestionsCommand,
  InitializeExamQuestionsResult,
} from './initialize-exam-questions.command';
import { ExamSectionEntity } from '../../../domain/entities/exam-section.entity';
import { ExamQuestionEntity } from '../../../domain/entities/exam-question.entity';
import { QuestionEntity } from '../../../domain/entities/question.entity';
import { QuestionChoiceEntity } from '../../../domain/entities/question-choice.entity';
import { QuestionMetadataEntity } from '../../../domain/entities/question-metadata.entity';
import { ExamStrategyRegistry } from '../../../domain/exam-strategies/exam-strategy.registry';

@CommandHandler(InitializeExamQuestionsCommand)
export class InitializeExamQuestionsHandler
  implements ICommandHandler<InitializeExamQuestionsCommand, InitializeExamQuestionsResult>
{
  private readonly logger = new Logger(InitializeExamQuestionsHandler.name);

  constructor(
    @Inject(CERTIFICATION_REPOSITORY)
    private readonly repo: ICertificationRepository,
    private readonly strategyRegistry: ExamStrategyRegistry,
  ) {}

  async execute(command: InitializeExamQuestionsCommand): Promise<InitializeExamQuestionsResult> {
    const { examId, userId, certificationType } = command;

    this.logger.log(`Initializing ${certificationType} questions for exam ${examId}`);

    const exam = await this.repo.findExamById(examId);
    if (!exam) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }
    const collection = await this.repo.findCollectionById(exam.getCollectionId());
    if (!collection || collection.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only initialize your own exams');
    }

    const strategy = this.strategyRegistry.get(certificationType);
    if (!strategy) {
      throw new NotFoundException(`No exam strategy found for certification type: ${certificationType}`);
    }

    const structure = strategy.getStructure();

    const existingSections = await this.repo.findSectionsByExamId(examId);
    const existingQuestions = await this.repo.findExamQuestionsByExamId(examId);
    if (existingQuestions.length > 0) {
      this.logger.log(`Exam ${examId} already has ${existingQuestions.length} questions, skipping init`);
      return {
        examId,
        sectionsCreated: existingSections.length,
        questionsCreated: existingQuestions.length,
      };
    }

    let sectionsCreated = 0;
    let questionsCreated = 0;

    await this.repo.withTransaction(async () => {
      const sectionMap = new Map<number, string>();

      if (existingSections.length > 0) {
        for (const sec of existingSections) {
          sectionMap.set(sec.getOrder(), sec.id);
        }
      }

      for (const sectionDef of structure.sections) {
        let sectionId = sectionMap.get(sectionDef.order);

        if (!sectionId) {
          const section = ExamSectionEntity.create({
            id: randomUUID(),
            examId,
            title: sectionDef.title,
            subtitle: null,
            sectionType: sectionDef.sectionType,
            instruction: null,
            order: sectionDef.order,
            durationMinutes: sectionDef.durationMinutes,
            questionCount: sectionDef.questionSlots.length,
            isBreak: false,
          });
          const saved = await this.repo.saveExamSection(section);
          sectionId = saved.id;
          sectionMap.set(sectionDef.order, sectionId);
        }

        for (let qIdx = 0; qIdx < sectionDef.questionSlots.length; qIdx++) {
          const slot = sectionDef.questionSlots[qIdx];
          const questionId = randomUUID();
          const defaults = strategy.createQuestionDefaults(slot);

          const question = QuestionEntity.create({
            id: questionId,
            content: defaults.content,
            type: slot.questionType,
            difficulty: 'Medium',
            category: null,
            status: 'draft',
            createdBy: userId,
            updatedBy: userId,
          });

          const defaultOptions = defaults.options.map((opt, i) =>
            QuestionChoiceEntity.create({
              id: randomUUID(),
              questionId,
              content: opt.content,
              isCorrect: opt.isCorrect,
              order: i,
              createdBy: userId,
              updatedBy: userId,
            })
          );

          const metadata = QuestionMetadataEntity.create({
            id: randomUUID(),
            questionId,
            explanation: null,
            points: slot.points,
            estimatedTime: slot.estimatedTime ? String(slot.estimatedTime) : null,
            shuffleOptions: false,
            modelAnswer: null,
            rubric: null,
            passageText: null,
          });
          metadata.calculateQualityScore();

          await this.repo.saveQuestionWithChoices(question, defaultOptions, metadata);

          const examQuestion = ExamQuestionEntity.create({
            id: randomUUID(),
            examId,
            questionId,
            sectionId,
            order: qIdx,
            points: slot.points,
            createdBy: userId,
            updatedBy: userId,
            audioMediaId: null,
            imageMediaId: null,
            partNumber: sectionDef.order,
            formatMetadata: null,
            passageGroupId: slot.passageGroupId ?? null,
            passageType: slot.passageType ?? null,
            passageTitle: null,
            blankNumber: null,
            subQuestionNumber: null,
          });
          await this.repo.saveExamQuestion(examQuestion);
          questionsCreated++;
        }

        sectionsCreated++;
      }

      exam.update({ totalQuestions: questionsCreated });
      await this.repo.saveExam(exam);
    });

    this.logger.log(
      `Exam ${examId} initialized: ${sectionsCreated} sections, ${questionsCreated} questions`
    );

    return { examId, sectionsCreated, questionsCreated };
  }
}
