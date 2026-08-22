import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  ICertificationRepository,
} from '../../../domain/repositories/certification.repository.interface';
import { CERTIFICATION_REPOSITORY } from '../../../domain/repositories/certification.repository.interface';
import {
  SaveExamContentCommand,
  SaveExamContentResult,
} from './save-exam-content.command';
import { ExamSectionEntity } from '../../../domain/entities/exam-section.entity';
import { ExamQuestionEntity } from '../../../domain/entities/exam-question.entity';
import { QuestionEntity } from '../../../domain/entities/question.entity';
import { QuestionChoiceEntity } from '../../../domain/entities/question-choice.entity';
import { QuestionMetadataEntity } from '../../../domain/entities/question-metadata.entity';
import { SaveExamContentQuestionDto, SaveExamContentSectionDto } from '../../dtos/save-exam-content.dto';

@CommandHandler(SaveExamContentCommand)
export class SaveExamContentHandler
  implements ICommandHandler<SaveExamContentCommand, SaveExamContentResult>
{
  private readonly logger = new Logger(SaveExamContentHandler.name);

  constructor(
    @Inject(CERTIFICATION_REPOSITORY)
    private readonly repo: ICertificationRepository
  ) {}

  async execute(command: SaveExamContentCommand): Promise<SaveExamContentResult> {
    const { examId, userId, dto } = command;

    this.logger.log(`Saving exam content for ${examId} by user ${userId}`);

    await this.validateOwnership(examId, userId);
    await this.updateExamMetadata(examId, dto);
    await this.replaceSectionsAndQuestions(examId, userId, dto);

    const totalQuestions = dto.sections.reduce(
      (sum, s) => sum + s.questions.length, 0
    );
    await this.updateExamTotalQuestions(examId, totalQuestions);

    this.logger.log(
      `Exam ${examId} saved: ${dto.sections.length} sections, ${totalQuestions} questions`
    );

    return {
      examId,
      sectionsCreated: dto.sections.length,
      questionsCreated: totalQuestions,
    };
  }

  private async validateOwnership(examId: string, userId: string): Promise<void> {
    const exam = await this.repo.findExamById(examId);
    if (!exam) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }
    const collection = await this.repo.findCollectionById(exam.getCollectionId());
    if (!collection || collection.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only edit your own exams');
    }
  }

  private async updateExamMetadata(
    examId: string,
    dto: { title?: string; description?: string; level?: string; duration?: number }
  ): Promise<void> {
    if (!dto.title && !dto.description && !dto.duration && !dto.level) return;

    const exam = await this.repo.findExamById(examId);
    if (!exam) return;

    exam.update({
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.duration !== undefined && { duration: dto.duration }),
      ...(dto.level !== undefined && { level: dto.level }),
    });
    await this.repo.saveExam(exam);
  }

  private async replaceSectionsAndQuestions(
    examId: string,
    userId: string,
    dto: { sections: SaveExamContentSectionDto[] }
  ): Promise<void> {
    await this.repo.deleteAllExamQuestionsByExamId(examId);
    await this.repo.deleteAllSectionsByExamId(examId);

    for (const sectionDto of dto.sections) {
      await this.createSectionWithQuestions(examId, userId, sectionDto);
    }
  }

  private async createSectionWithQuestions(
    examId: string,
    userId: string,
    sectionDto: SaveExamContentSectionDto
  ): Promise<void> {
    const sectionId = sectionDto.id || randomUUID();

    const section = ExamSectionEntity.create({
      id: sectionId,
      examId,
      title: sectionDto.title,
      subtitle: sectionDto.subtitle ?? null,
      sectionType: sectionDto.sectionType,
      instruction: sectionDto.instruction ?? null,
      order: sectionDto.order,
      durationMinutes: sectionDto.durationMinutes ?? 0,
      questionCount: sectionDto.questions.length,
      isBreak: sectionDto.isBreak ?? false,
    });
    await this.repo.saveExamSection(section);

    let order = 0;
    for (const questionDto of sectionDto.questions) {
      const questionId = await this.createQuestionInBank(questionDto, userId);
      await this.createExamQuestionLink(examId, questionId, sectionId, order++, sectionDto.order, questionDto, userId);
    }
  }

  private async createQuestionInBank(
    dto: SaveExamContentQuestionDto,
    userId: string
  ): Promise<string> {
    const questionId = dto.id || randomUUID();

    const question = QuestionEntity.create({
      id: questionId,
      content: dto.questionText,
      type: dto.questionType,
      difficulty: dto.difficulty,
      category: null,
      status: 'draft',
      createdBy: userId,
      updatedBy: userId,
    });

    const choices = dto.options.map((opt, index) =>
      QuestionChoiceEntity.create({
        id: opt.id || randomUUID(),
        questionId,
        content: opt.text,
        isCorrect: opt.isCorrect,
        order: index,
        createdBy: userId,
        updatedBy: userId,
      })
    );

    const metadata = QuestionMetadataEntity.create({
      id: randomUUID(),
      questionId,
      explanation: dto.explanation || null,
      points: dto.points,
      estimatedTime: dto.estimatedTime ? String(dto.estimatedTime) : null,
      shuffleOptions: false,
      modelAnswer: dto.modelAnswer || null,
      rubric: dto.rubric || null,
      passageText: dto.passageText || null,
    });
    metadata.calculateQualityScore();

    await this.repo.saveQuestionWithChoices(question, choices, metadata);
    return questionId;
  }

  private async createExamQuestionLink(
    examId: string,
    questionId: string,
    sectionId: string,
    order: number,
    sectionOrder: number,
    dto: SaveExamContentQuestionDto,
    userId: string
  ): Promise<void> {
    const entity = ExamQuestionEntity.create({
      id: randomUUID(),
      examId,
      questionId,
      sectionId,
      order,
      points: dto.points,
      createdBy: userId,
      updatedBy: userId,
      audioUrl: dto.audioUrl ?? null,
      imageUrl: dto.imageUrl ?? null,
      partNumber: sectionOrder,
      passageGroupId: dto.passageGroupId ?? null,
      passageType: dto.passageType ?? null,
      passageTitle: dto.passageTitle ?? null,
      blankNumber: dto.blankNumber ?? null,
      subQuestionNumber: dto.subQuestionNumber ?? null,
    });
    await this.repo.saveExamQuestion(entity);
  }

  private async updateExamTotalQuestions(examId: string, total: number): Promise<void> {
    const exam = await this.repo.findExamById(examId);
    if (!exam) return;
    exam.update({ totalQuestions: total });
    await this.repo.saveExam(exam);
  }
}
