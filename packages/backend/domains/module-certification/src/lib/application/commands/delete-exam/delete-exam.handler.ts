import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { DeleteExamCommand } from './delete-exam.command';

@CommandHandler(DeleteExamCommand)
export class DeleteExamCommandHandler implements ICommandHandler<DeleteExamCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: DeleteExamCommand) {
    const { examId, userId } = command;

    const existing = await this.repository.findExamById(examId);
    if (!existing) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }

    const collection = await this.repository.findCollectionById(existing.getCollectionId());
    if (!collection || collection.getOwnerId() !== userId) {
      throw new ForbiddenException('You can only delete exams in your own collections');
    }

    const collectionId = existing.getCollectionId();
    await this.repository.deleteExam(examId);

    return { deleted: true, collectionId };
  }
}
