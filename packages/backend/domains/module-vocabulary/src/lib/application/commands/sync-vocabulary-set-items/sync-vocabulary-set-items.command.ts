import { SyncVocabularySetItemsDto } from '../../dtos/sync-vocabulary-set-items.dto';

export class SyncVocabularySetItemsCommand {
  constructor(
    public readonly userId: string,
    public readonly setId: string,
    public readonly dto: SyncVocabularySetItemsDto
  ) {}
}
