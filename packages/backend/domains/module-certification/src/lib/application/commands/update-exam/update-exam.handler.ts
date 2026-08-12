import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { UpdateExamCommand } from './update-exam.command';

@CommandHandler(UpdateExamCommand)
export class UpdateExamCommandHandler implements ICommandHandler<UpdateExamCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: UpdateExamCommand) {
    const { examId, userId, title, description, duration, totalQuestions, maxScore, passScore, examType, publishStatus, certificationType } = command;

    const existing = await this.repository.findExamById(examId);
    if (!existing) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }

    const collection = await this.repository.findCollectionById(existing.getCollectionId());
    if (!collection || collection.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only edit exams in your own collections');
    }

    existing.update({
      title,
      description,
      duration,
      totalQuestions,
      maxScore,
      passScore,
      examType,
      publishStatus,
      certificationType,
      updatedBy: userId,
    });

    await this.repository.saveExam(existing);

    return { id: examId, collectionId: existing.getCollectionId() };
  }
}
