import {
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UpdateVocabularySetCommand } from './update-vocabulary-set.command';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';
import * as vocabularySetItemRepositoryInterface from '../../../domain/repositories/vocabulary-set-item.repository.interface';
import { Inject, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { VocabularySetResponseDto } from '../../dtos/reponse-vocabulary-set.dto';
import { DifficultyVO } from '../../../domain/value-objects/difficulty.vo';

@CommandHandler(UpdateVocabularySetCommand)
export class UpdateVocabularySetHandler
  implements ICommandHandler<UpdateVocabularySetCommand, VocabularySetResponseDto>
{
  private readonly logger = new Logger(UpdateVocabularySetHandler.name);

  constructor(
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    @Inject(vocabularySetItemRepositoryInterface.VOCABULARY_SET_ITEM_REPOSITORY)
    private readonly vocabularySetItemRepository: vocabularySetItemRepositoryInterface.IVocabularySetItemRepository
  ) {}

  async execute(
    command: UpdateVocabularySetCommand
  ): Promise<VocabularySetResponseDto> {
    const { userId, setId, payload } = command;
    this.logger.log(`[Update Set] Request to update set ${setId} by user ${userId} with payload: ${JSON.stringify(payload)}`);

    const set = await this.vocabularySetRepository.findById(setId);

    if (!set) {
      this.logger.warn(`[Update Set] Set ${setId} not found`);
      throw new NotFoundException('Vocabulary set not found');
    }

    if (!set.isOwnedBy(userId)) {
      this.logger.warn(`[Update Set] User ${userId} is not the owner of set ${setId}`);
      throw new ForbiddenException('You do not have permission to update this set');
    }

    // Always recalculate actual entry count to prevent out-of-sync or stale DB fields
    const { total } = await this.vocabularySetItemRepository.findByVocabularySetId(setId, { limit: 1 });
    this.logger.log(`[Update Set] Entry count for set ${setId} recalculated to ${total} (was ${set.getEntryCount()})`);
    set.setEntryCount(total);

    if (
      payload.title !== undefined ||
      payload.description !== undefined
    ) {
      this.logger.log(`[Update Set] Updating info for set ${setId}: title="${payload.title}", description="${payload.description}"`);
      set.updateInfo(payload.title, payload.description);
    }

    if (payload.difficulty) {
      this.logger.log(`[Update Set] Updating difficulty for set ${setId} to ${payload.difficulty}`);
      set.updateDifficulty(DifficultyVO.create(payload.difficulty));
    }

    if (payload.tags) {
      this.logger.log(`[Update Set] Setting tags for set ${setId} to ${JSON.stringify(payload.tags)}`);
      set.setTags(payload.tags);
    }

    if (payload.visibility) {
      if (payload.visibility === 'PUBLIC' && !set.getIsPublic()) {
        try {
          this.logger.log(`[Update Set] Attempting to publish set ${setId} (entryCount: ${set.getEntryCount()}, description length: ${set.getDescription()?.length || 0}, tags count: ${set.getTags().length})`);
          set.publish();
          this.logger.log(`[Update Set] Set ${setId} successfully published to PUBLIC`);
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unable to publish set';
          this.logger.error(`[Update Set] Failed to publish set ${setId}: ${msg}`);
          throw new BadRequestException(msg);
        }
      } else if (payload.visibility === 'PRIVATE' && set.getIsPublic()) {
        this.logger.log(`[Update Set] Unpublishing set ${setId} to PRIVATE`);
        set.unpublish();
      }
    }

    const updated = await this.vocabularySetRepository.update(set);
    this.logger.log(`[Update Set] Successfully saved changes for set ${setId} in DB`);

    // Map updated aggregate to response DTO (same shape as in CreateVocabularySetHandler)
    const dto = new VocabularySetResponseDto();
    dto.id = updated.getId();
    dto.title = updated.getTitle();
    dto.description = updated.getDescription();
    dto.language = updated.getLanguage().getValue();
    dto.type = updated.getType().getValue();
    dto.difficulty = updated.getDifficulty()?.getValue() || null;
    dto.isPublic = updated.getIsPublic();
    dto.isActive = updated.getIsActive();
    dto.tags = updated.getTags();
    dto.coverImage = updated.getCoverImage();
    dto.userId = updated.getUserId();
    dto.entryCount = updated.getEntryCount();
    dto.favoriteCount = updated.getFavoriteCount();
    dto.studyCount = updated.getStudyCount();
    dto.importStatus = updated.getImportStatus();
    dto.importProgress = updated.getImportProgress();
    dto.createdAt = updated.getCreatedAt();
    dto.updatedAt = updated.getUpdatedAt();

    return dto;
  }
}

