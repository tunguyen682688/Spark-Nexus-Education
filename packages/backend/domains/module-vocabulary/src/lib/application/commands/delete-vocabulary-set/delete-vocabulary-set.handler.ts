import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { DeleteVocabularySetCommand } from './delete-vocabulary-set.command';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';

export interface DeleteVocabularySetResult {
  id: string;
  deleted: boolean;
}

@CommandHandler(DeleteVocabularySetCommand)
export class DeleteVocabularySetHandler
  implements ICommandHandler<DeleteVocabularySetCommand, DeleteVocabularySetResult>
{
  private readonly logger = new Logger(DeleteVocabularySetHandler.name);

  constructor(
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository
  ) {}

  async execute(command: DeleteVocabularySetCommand): Promise<DeleteVocabularySetResult> {
    const { userId, setId } = command;
    this.logger.log(`[Delete Set] Request to delete set ${setId} by user ${userId}`);

    // Find the vocabulary set
    const set = await this.vocabularySetRepository.findById(setId);
    if (!set) {
      this.logger.warn(`[Delete Set] Set ${setId} not found`);
      throw new NotFoundException('Vocabulary set not found');
    }

    // Verify ownership
    if (!set.isOwnedBy(userId)) {
      this.logger.warn(`[Delete Set] User ${userId} is not authorized to delete set ${setId}`);
      throw new ForbiddenException(
        'You do not have permission to delete this vocabulary set'
      );
    }

    // Soft delete the vocabulary set
    this.logger.log(`[Delete Set] Soft-deleting set ${setId}`);
    set.deactivate();
    await this.vocabularySetRepository.update(set);
    this.logger.log(`[Delete Set] Set ${setId} soft-deleted successfully in database`);

    return {
      id: setId,
      deleted: true,
    };
  }
}

