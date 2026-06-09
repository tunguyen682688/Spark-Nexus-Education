import {
  CommandHandler,
  ICommandHandler,
} from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AddWordToSetCommand } from './add-word-to-set.command';
import * as vocabularySetRepositoryInterface from '../../../domain/repositories/vocabulary-set.repository.interface';
import * as vocabularySetItemRepositoryInterface from '../../../domain/repositories/vocabulary-set-item.repository.interface';
import * as entryRepositoryInterface from '../../../domain/repositories/entry.repository.interface';
import { VocabularySetItemEntity } from '../../../domain/entities/vocabulary-set-item.entity';
import { VocabularySetItemDto, WordMinimumDto } from '../../dtos/reponse-word.dto';

@CommandHandler(AddWordToSetCommand)
export class AddWordToSetHandler
  implements ICommandHandler<AddWordToSetCommand, VocabularySetItemDto>
{
  constructor(
    @Inject(vocabularySetRepositoryInterface.VOCABULARY_SET_REPOSITORY)
    private readonly vocabularySetRepository: vocabularySetRepositoryInterface.IVocabularySetRepository,
    @Inject(vocabularySetItemRepositoryInterface.VOCABULARY_SET_ITEM_REPOSITORY)
    private readonly vocabularySetItemRepository: vocabularySetItemRepositoryInterface.IVocabularySetItemRepository,
    @Inject(entryRepositoryInterface.ENTRY_REPOSITORY)
    private readonly entryRepository: entryRepositoryInterface.IEntryRepository
  ) {}

  async execute(command: AddWordToSetCommand): Promise<VocabularySetItemDto> {
    const { userId, setId, payload } = command;

    const set = await this.vocabularySetRepository.findById(setId);
    if (!set) {
      throw new NotFoundException('Vocabulary set not found');
    }
    if (!set.isOwnedBy(userId)) {
      throw new ForbiddenException('You do not have permission to modify this set');
    }

    const language = set.getLanguage().getValue();

    let entryId: string;
    let wordText: string;
    let definition: string | null = payload.word?.definition?.trim() || null;
    let example: string | null = payload.word?.example?.trim() || null;
    const notes: string | null = payload.word?.notes?.trim() || null;

    const providedPartOfSpeech = payload.word?.partOfSpeech?.trim() || null;

    if (payload.wordId) {
      const entry = await this.entryRepository.findById(payload.wordId);
      if (!entry) {
        throw new NotFoundException('Entry not found');
      }
      entryId = entry.id;
      wordText = entry.word;
      if (!definition) {
        definition = entry.definition;
      }
      if (!example) {
        example = entry.example;
      }
      // Update entry with provided data (definition, example, partOfSpeech)
      if (providedPartOfSpeech || definition || example) {
        await this.entryRepository.updateEntry(entryId, {
          definition,
          example,
          partOfSpeech: providedPartOfSpeech,
        });
      }
    } else if (payload.word) {
      const rawWord = payload.word.word?.trim();
      if (!rawWord) {
        throw new BadRequestException('Word is required when creating new entry');
      }
      wordText = rawWord;

      const existing = await this.entryRepository.findByWord(wordText, language);
      if (existing) {
        entryId = existing.id;
        if (!definition) {
          definition = existing.definition;
        }
        if (!example) {
          example = existing.example;
        }
        // Update entry with provided data for existing entry
        if (providedPartOfSpeech || definition || example) {
          await this.entryRepository.updateEntry(entryId, {
            definition,
            example,
            partOfSpeech: providedPartOfSpeech,
          });
        }
      } else {
        const created = await this.entryRepository.createBasicEntry({
          word: wordText,
          language,
          definition: definition ?? undefined,
          example: example ?? undefined,
          partOfSpeech: providedPartOfSpeech ?? undefined,
        });
        entryId = created.id;
        if (!definition) {
          definition = created.definition;
        }
        if (!example) {
          example = created.example;
        }
      }
    } else {
      throw new BadRequestException('Either wordId or word payload must be provided');
    }

    const position = set.getEntryCount() + 1;
    const itemId = crypto.randomUUID();

    const itemEntity = VocabularySetItemEntity.create(
      itemId,
      entryId,
      setId,
      wordText,
      definition,
      example,
      notes,
      position
    );

    set.incrementEntryCount();
    set.raiseEntryAddedEvent(entryId, itemEntity.getId());

    await this.vocabularySetItemRepository.create(itemEntity);
    await this.vocabularySetRepository.update(set);

    const minimumDetailsArr = await this.entryRepository.findByIdsMinimum([entryId]);
    let wordMinimum: WordMinimumDto | undefined;
    if (minimumDetailsArr.length > 0) {
      const entry = minimumDetailsArr[0];
      wordMinimum = {
        id: entry.id,
        word: entry.word,
        definition: entry.definition,
        example: entry.example,
        pronunciation: entry.pronunciation,
        partOfSpeech: entry.partOfSpeech,
      };
    }

    const itemDto: VocabularySetItemDto = {
      id: itemEntity.getId(),
      entryId: itemEntity.getEntryId(),
      vocabularySetId: itemEntity.getVocabularySetId(),
      customWord: itemEntity.getWord(),
      customDefinition: itemEntity.getDefinition(),
      customExample: itemEntity.getExample(),
      notes: itemEntity.getNotes(),
      position: itemEntity.getPosition(),
      addedAt: itemEntity.getAddedAt(),
      ...(wordMinimum ? { wordMinimum } : {}),
    };

    return itemDto;
  }
}


