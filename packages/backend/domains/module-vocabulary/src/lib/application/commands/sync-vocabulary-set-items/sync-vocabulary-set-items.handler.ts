import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SyncVocabularySetItemsCommand } from './sync-vocabulary-set-items.command';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';
import * as vocabularySetItemRepositoryInterface from '../../../domain/repositories/vocabulary-set-item.repository.interface';
import * as entryRepositoryInterface from '../../../domain/repositories/entry.repository.interface';
import { VocabularySetItemEntity } from '../../../domain/entities/vocabulary-set-item.entity';
import { SyncItemDto } from '../../dtos/sync-vocabulary-set-items.dto';

@CommandHandler(SyncVocabularySetItemsCommand)
export class SyncVocabularySetItemsHandler implements ICommandHandler<SyncVocabularySetItemsCommand, void> {
  private readonly logger = new Logger(SyncVocabularySetItemsHandler.name);

  constructor(
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    @Inject(vocabularySetItemRepositoryInterface.VOCABULARY_SET_ITEM_REPOSITORY)
    private readonly vocabularySetItemRepository: vocabularySetItemRepositoryInterface.IVocabularySetItemRepository,
    @Inject(entryRepositoryInterface.ENTRY_REPOSITORY)
    private readonly entryRepository: entryRepositoryInterface.IEntryRepository
  ) {}

  async execute(command: SyncVocabularySetItemsCommand): Promise<void> {
    const { userId, setId, dto } = command;
    this.logger.log(`[Sync Items] Received request for set ${setId} by user ${userId}. Deletions: ${dto.deleteIds?.length || 0}, Upserts: ${dto.items?.length || 0}`);

    const set = await this.vocabularySetRepository.findById(setId);
    if (!set) {
      this.logger.warn(`[Sync Items] Set ${setId} not found`);
      throw new NotFoundException('Vocabulary set not found');
    }
    if (!set.isOwnedBy(userId)) {
      this.logger.warn(`[Sync Items] User ${userId} is not the owner of set ${setId}`);
      throw new ForbiddenException('You do not have permission to modify this set');
    }

    const language = set.getLanguage().getValue();

    // 1. Handle Deletions
    if (dto.deleteIds && dto.deleteIds.length > 0) {
        this.logger.log(`[Sync Items] Deleting ${dto.deleteIds.length} items from set ${setId}`);
        for (const id of dto.deleteIds) {
            const item = await this.vocabularySetItemRepository.findById(id);
            if (item && item.getVocabularySetId() === setId) {
                this.logger.log(`[Sync Items] Soft-deleting item ${id} ("${item.getWord()}") from set ${setId}`);
                await this.vocabularySetItemRepository.softDelete(id);
            } else {
                this.logger.warn(`[Sync Items] Item ${id} not found or does not belong to set ${setId}`);
            }
        }
    }

    // 2. Handle Upserts
    if (dto.items && dto.items.length > 0) {
        this.logger.log(`[Sync Items] Processing ${dto.items.length} upserts for set ${setId}`);
        for (const itemDto of dto.items) {
            await this.processItem(itemDto, setId, language);
        }
    }

    // 3. Recalculate and update the vocabulary set entry count in the database
    const { total } = await this.vocabularySetItemRepository.findByVocabularySetId(setId, { limit: 1 });
    this.logger.log(`[Sync Items] Sync finished for set ${setId}. Recalculating entryCount to total: ${total} (was ${set.getEntryCount()})`);
    set.setEntryCount(total);
    await this.vocabularySetRepository.update(set);
  }

  private async processItem(payload: SyncItemDto, setId: string, language: string) {
      if (payload.id) {
          // Update existing item
          const item = await this.vocabularySetItemRepository.findById(payload.id);
          if (!item || item.getVocabularySetId() !== setId) {
              this.logger.warn(`[Sync Items] Cannot update item ${payload.id}: not found or not in set ${setId}`);
              return; 
          }
          
          const wordText = payload.word?.word?.trim();
          this.logger.log(`[Sync Items] Updating existing item ${payload.id} in set ${setId} (word: "${wordText}")`);
          const definition = payload.word?.definition?.trim();
          const example = payload.word?.example?.trim();
          const notes = payload.word?.notes?.trim();
          const partOfSpeech = payload.word?.partOfSpeech?.trim();

          item.updateWordData({
            word: wordText,
            definition: definition !== undefined ? (definition || null) : undefined,
            example: example !== undefined ? (example || null) : undefined,
            notes: notes !== undefined ? (notes || null) : undefined,
          });
          
          if (item.getEntryId()) {
             this.logger.log(`[Sync Items] Updating backing entry ${item.getEntryId()} for word "${wordText}"`);
             await this.entryRepository.updateEntry(item.getEntryId(), {
                word: wordText,
                definition: definition !== undefined ? (definition || null) : undefined,
                example: example !== undefined ? (example || null) : undefined,
                partOfSpeech: partOfSpeech !== undefined ? (partOfSpeech || null) : undefined,
             });
          }

          await this.vocabularySetItemRepository.update(item);

      } else {
          // Create new item
          let entryId: string;
          let wordText: string;
          let definition: string | null = payload.word?.definition?.trim() || null;
          let example: string | null = payload.word?.example?.trim() || null;
          const notes: string | null = payload.word?.notes?.trim() || null;
          const providedPartOfSpeech = payload.word?.partOfSpeech?.trim() || null;

          if (payload.wordId) {
             const entry = await this.entryRepository.findById(payload.wordId);
             if (!entry) {
                 this.logger.warn(`[Sync Items] Referenced entry ${payload.wordId} not found`);
                 return;
             }
             entryId = entry.id;
             wordText = entry.word;
             this.logger.log(`[Sync Items] Adding word from existing entry "${wordText}" (ID: ${entryId}) to set ${setId}`);
             if (!definition) definition = entry.definition;
             if (!example) example = entry.example;
             
             if (providedPartOfSpeech || definition || example) {
                await this.entryRepository.updateEntry(entryId, {
                  definition,
                  example,
                  partOfSpeech: providedPartOfSpeech,
                });
             }
          } else if (payload.word) {
             const rawWord = payload.word.word?.trim();
             if (!rawWord) return;
             wordText = rawWord;
             
             const existing = await this.entryRepository.findByWord(wordText, language);
             if (existing) {
                 entryId = existing.id;
                 this.logger.log(`[Sync Items] Found existing entry for word "${wordText}" (ID: ${entryId}) in language ${language}. Attaching to set.`);
                 if (!definition) definition = existing.definition;
                 if (!example) example = existing.example;
                 if (providedPartOfSpeech || definition || example) {
                    await this.entryRepository.updateEntry(entryId, {
                        definition,
                        example,
                        partOfSpeech: providedPartOfSpeech,
                    });
                 }
             } else {
                 this.logger.log(`[Sync Items] Creating new basic entry for word "${wordText}" in language ${language}`);
                 const created = await this.entryRepository.createBasicEntry({
                    word: wordText,
                    language,
                    definition: definition ?? undefined,
                    example: example ?? undefined,
                    partOfSpeech: providedPartOfSpeech ?? undefined,
                 });
                 entryId = created.id;
             }
          } else {
              return;
          }

          // Check if item already exists in this set
          const existingItem = await this.vocabularySetItemRepository.findBySetAndEntryId(setId, entryId);

          if (existingItem) {
            // If item exists (even if deleted), update it and ensure it's not deleted
            this.logger.log(`[Sync Items] Word "${wordText}" already exists in set ${setId}. Updating/Restoring.`);
            existingItem.updateWordData({
              word: wordText,
              definition: definition !== undefined ? (definition || null) : undefined,
              example: example !== undefined ? (example || null) : undefined,
              notes: notes !== undefined ? (notes || null) : undefined,
            });
            
            if (existingItem.isDeleted()) {
              existingItem.restore();
            }

            await this.vocabularySetItemRepository.update(existingItem);
          } else {
            this.logger.log(`[Sync Items] Creating new vocabulary set item for word "${wordText}" in set ${setId}`);
            const newItem = VocabularySetItemEntity.create(
              randomUUID(),
              entryId,
              setId,
              wordText,
              definition,
              example,
              notes,
              0
            );
            
            await this.vocabularySetItemRepository.create(newItem);
          }
      }
  }
}
