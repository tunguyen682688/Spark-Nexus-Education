import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteWordFromSetCommand } from './delete-word-from-set.command';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';
import * as vocabularySetItemRepositoryInterface from '../../../domain/repositories/vocabulary-set-item.repository.interface';

export interface DeleteWordResult {
  id: string;
  deleted: boolean;
}

@CommandHandler(DeleteWordFromSetCommand)
export class DeleteWordFromSetHandler
  implements ICommandHandler<DeleteWordFromSetCommand, DeleteWordResult>
{
  constructor(
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    @Inject(vocabularySetItemRepositoryInterface.VOCABULARY_SET_ITEM_REPOSITORY)
    private readonly vocabularySetItemRepository: vocabularySetItemRepositoryInterface.IVocabularySetItemRepository
  ) {}

  async execute(command: DeleteWordFromSetCommand): Promise<DeleteWordResult> {
    const { userId, setId, itemId } = command;

    // Verify set exists and user owns it
    const set = await this.vocabularySetRepository.findById(setId);
    if (!set) {
      throw new NotFoundException('Vocabulary set not found');
    }
    if (!set.isOwnedBy(userId)) {
      throw new ForbiddenException(
        'You do not have permission to modify this set'
      );
    }

    // Verify item exists and belongs to this set
    const item = await this.vocabularySetItemRepository.findById(itemId);
    if (!item || item.getVocabularySetId() !== setId) {
      throw new NotFoundException('Vocabulary set item not found');
    }

    // Soft delete the item
    await this.vocabularySetItemRepository.softDelete(itemId);

    // Update entry count on the set
    set.decrementEntryCount();
    await this.vocabularySetRepository.update(set);

    return {
      id: itemId,
      deleted: true,
    };
  }
}

