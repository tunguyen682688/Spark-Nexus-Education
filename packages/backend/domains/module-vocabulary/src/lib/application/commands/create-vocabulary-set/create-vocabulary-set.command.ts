import { Command } from '@nestjs/cqrs';
import { VocabularySetResponseDto } from '../../dtos/reponse-vocabulary-set.dto';
import { DifficultyLevel } from '../../../domain/value-objects/difficulty.vo';
import { Language } from '../../../domain/value-objects/language.vo';
import { SetType } from '../../../domain/value-objects/set-type.vo';


/**
 * Command: CreateVocabularySet
 * Creates a new vocabulary set for a user
 * Maps to UC-VOC-001: Create Vocabulary Package
 *
 * Command Pattern Benefits:
 * - Encapsulates all information needed to perform an action
 * - Provides clear contract for command handlers
 * - Supports validation at command level
 * - Enables middleware/interceptors for logging, authorization
 */
export interface InitialVocabularyWordInput {
  word: string;
  definition?: string;
  example?: string;
  notes?: string;
  partOfSpeech?: string;
}

export class CreateVocabularySetCommand extends Command<VocabularySetResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly title: string,
    public readonly language: Language,
    public readonly type: SetType,
    public readonly coverImageUrl?: string,
    public readonly description?: string,
    public readonly difficulty?: DifficultyLevel,
    public readonly tags?: string[],
    public readonly initialWords?: InitialVocabularyWordInput[]
  ) {
    super();
    // Command validation - business rules at command level
    if (!userId || userId.trim().length === 0) {
      throw new Error('UserId is required');
    }
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (title.length > 200) {
      throw new Error('Title cannot exceed 200 characters');
    }
  }

  /**
   * Factory method: Tạo command từ DTO
   * Sử dụng trong Controller để chuyển từ HTTP request sang Command
   */
  static fromDto(
    userId: string,
    dto: {
      title: string;
      language: Language;
      type: SetType;
      coverImageUrl?: string;
      description?: string;
      difficulty?: DifficultyLevel;
      tags?: string[];
      initialEntryIds?: string[];
      initialWords?: InitialVocabularyWordInput[];
    }
  ): CreateVocabularySetCommand {
    return new CreateVocabularySetCommand(
      userId,
      dto.title,
      dto.language,
      dto.type,
      dto.coverImageUrl,
      dto.description,
      dto.difficulty,
      dto.tags,
      dto.initialWords
    );
  }
}
