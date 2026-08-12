import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { UnlinkQuestionFromExamCommand } from './unlink-question-from-exam.command';

@CommandHandler(UnlinkQuestionFromExamCommand)
export class UnlinkQuestionFromExamCommandHandler
  implements ICommandHandler<UnlinkQuestionFromExamCommand, void>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: UnlinkQuestionFromExamCommand): Promise<void> {
    const { examId, questionId, userId } = command;

    const exam = await this.repository.findExamById(examId);
    if (!exam) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }

    const collection = await this.repository.findCollectionById(exam.getCollectionId());
    if (!collection || collection.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only modify questions in your own exams');
    }

    // Find the exam question before deletion to get sectionId
    const examQuestion = await this.repository.findExamQuestionByExamAndQuestion(examId, questionId);
    const sectionId = examQuestion?.getSectionId() ?? null;

    const deleted = await this.repository.deleteExamQuestion(examId, questionId);
    if (!deleted) {
      throw new NotFoundException(`Question ${questionId} is not linked to exam ${examId}`);
    }

    // Recalculate exam totalQuestions counter
    const newTotal = await this.repository.countExamQuestionsByExamId(examId);
    exam.update({ totalQuestions: newTotal, updatedBy: userId });
    await this.repository.saveExam(exam);

    // Recalculate section questionCount
    if (sectionId) {
      const section = await this.repository.findSectionById(sectionId);
      if (section) {
        const sectionCount = await this.repository.countExamQuestionsBySectionId(examId, sectionId);
        section.update({ questionCount: sectionCount });
        await this.repository.saveExamSection(section);
      }
    }
  }
}
