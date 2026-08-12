import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { LinkQuestionToExamCommand } from './link-question-to-exam.command';
import { ExamQuestionEntity } from '../../../domain/entities/exam-question.entity';

@CommandHandler(LinkQuestionToExamCommand)
export class LinkQuestionToExamCommandHandler
  implements ICommandHandler<LinkQuestionToExamCommand, { examQuestionId: string }>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: LinkQuestionToExamCommand): Promise<{ examQuestionId: string }> {
    const { examId, questionId, userId, order, points, sectionId, formatFields } = command;

    const exam = await this.repository.findExamById(examId);
    if (!exam) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }

    // Ownership check
    const collection = await this.repository.findCollectionById(exam.getCollectionId());
    if (!collection || collection.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only modify questions in your own exams');
    }

    const question = await this.repository.findQuestionById(questionId);
    if (!question) {
      throw new NotFoundException(`Question ${questionId} not found`);
    }

    // Check for duplicate link
    const existing = await this.repository.findExamQuestionByExamAndQuestion(examId, questionId);
    if (existing) {
      // If sectionId changed, update the existing link (move between sections)
      if (sectionId !== undefined && sectionId !== existing.getSectionId()) {
        const oldSectionId = existing.getSectionId();
        existing.update({ sectionId, updatedBy: userId });
        await this.repository.saveExamQuestion(existing);

        // Update section counters for both old and new sections
        await this.updateSectionCounter(examId, oldSectionId);
        await this.updateSectionCounter(examId, sectionId);
      }
      return { examQuestionId: existing.id };
    }

    // Determine order: if not provided, use count of existing questions
    let finalOrder = order ?? 0;
    if (order === undefined) {
      finalOrder = await this.repository.countExamQuestionsByExamId(examId);
    }

    // Determine points: use provided value, else inherit from QuestionMetadata bank default
    let finalPoints = points;
    if (finalPoints === undefined) {
      const metadata = await this.repository.findMetadataByQuestionId(questionId);
      finalPoints = metadata?.getPoints() ?? 1;
    }

    const entity = ExamQuestionEntity.create({
      id: randomUUID(),
      examId,
      questionId,
      sectionId: sectionId ?? null,
      order: finalOrder,
      points: finalPoints,
      createdBy: userId,
      updatedBy: userId,
      ...formatFields,
    });

    const saved = await this.repository.saveExamQuestion(entity);

    // Recalculate exam totalQuestions counter
    const newTotal = await this.repository.countExamQuestionsByExamId(examId);
    exam.update({ totalQuestions: newTotal, updatedBy: userId });
    await this.repository.saveExam(exam);

    // Recalculate section questionCount
    if (sectionId) {
      await this.updateSectionCounter(examId, sectionId);
    }

    return { examQuestionId: saved.id };
  }

  private async updateSectionCounter(examId: string, sectionId: string | null): Promise<void> {
    if (!sectionId) return;
    const section = await this.repository.findSectionById(sectionId);
    if (!section) return;
    const count = await this.repository.countExamQuestionsBySectionId(examId, sectionId);
    section.update({ questionCount: count });
    await this.repository.saveExamSection(section);
  }
}
