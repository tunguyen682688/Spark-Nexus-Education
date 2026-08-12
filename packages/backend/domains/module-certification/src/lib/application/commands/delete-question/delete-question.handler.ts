import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { DeleteQuestionCommand } from './delete-question.command';
import type {
  ICertificationRepository,
} from '../../../domain/repositories/certification.repository.interface';
import { CERTIFICATION_REPOSITORY } from '../../../domain/repositories/certification.repository.interface';

export interface DeleteQuestionResultDto {
  id: string;
  deleted: boolean;
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionHandler
  implements ICommandHandler<DeleteQuestionCommand, DeleteQuestionResultDto>
{
  private readonly logger = new Logger(DeleteQuestionHandler.name);

  constructor(
    @Inject(CERTIFICATION_REPOSITORY)
    private readonly repo: ICertificationRepository
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<DeleteQuestionResultDto> {
    const { questionId, userId } = command;

    this.logger.log(`Deleting question ${questionId} by user ${userId}`);

    // Verify question exists
    const existing = await this.repo.findQuestionById(questionId);
    if (!existing) {
      throw new NotFoundException(`Question ${questionId} not found`);
    }

    // Ownership check: question creator OR owner of any exam linked to this question
    const examQuestions = await this.repo.findExamQuestionsByQuestionId(questionId);
    if (examQuestions.length > 0) {
      // Question is linked to at least one exam — user must own at least one of those exams
      let ownsAtLeastOne = false;
      for (const eq of examQuestions) {
        const exam = await this.repo.findExamById(eq.getExamId());
        if (exam) {
          const collection = await this.repo.findCollectionById(exam.getCollectionId());
          if (collection && collection.getOwnerId() === userId) {
            ownsAtLeastOne = true;
            break;
          }
        }
      }
      if (!ownsAtLeastOne) {
        throw new ForbiddenException('You can only delete questions in your own exams');
      }
    }

    // Cascade delete: choices, hints, media, metadata, versions, then question
    await this.repo.deleteQuestionCascade(questionId);

    this.logger.log(`Question ${questionId} deleted successfully`);

    return {
      id: questionId,
      deleted: true,
    };
  }
}
