import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
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

    // Cascade delete: choices, hints, media, metadata, versions, then question
    await this.repo.deleteQuestionCascade(questionId);

    this.logger.log(`Question ${questionId} deleted successfully`);

    return {
      id: questionId,
      deleted: true,
    };
  }
}
