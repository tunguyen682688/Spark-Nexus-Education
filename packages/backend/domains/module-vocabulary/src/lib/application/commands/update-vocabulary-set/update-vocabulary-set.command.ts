import { Command } from '@nestjs/cqrs';
import { DifficultyLevel } from '../../../domain/value-objects/difficulty.vo';
import { VocabularySetResponseDto } from '../../dtos/reponse-vocabulary-set.dto';

export class UpdateVocabularySetCommand extends Command<VocabularySetResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly setId: string,
    public readonly payload: {
      title?: string;
      description?: string;
      difficulty?: DifficultyLevel;
      tags?: string[];
      visibility?: 'PUBLIC' | 'PRIVATE';
    }
  ) {
    super();
  }
}

