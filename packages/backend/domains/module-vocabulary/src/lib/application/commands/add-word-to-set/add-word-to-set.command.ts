import { Command } from '@nestjs/cqrs';
import { AddWordToSetDto } from '../../dtos/add-word-to-set.dto';
import { VocabularySetItemDto } from '../../dtos/reponse-word.dto';

export class AddWordToSetCommand extends Command<VocabularySetItemDto> {
  constructor(
    public readonly userId: string,
    public readonly setId: string,
    public readonly payload: AddWordToSetDto
  ) {
    super();
  }
}


