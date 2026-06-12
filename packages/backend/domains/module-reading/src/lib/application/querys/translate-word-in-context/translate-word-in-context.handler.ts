import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TranslateWordInContextQuery } from './translate-word-in-context.query';
import { Inject } from '@nestjs/common';
import { TRANSLATION_SERVICE } from '../../../domain/services/translation.service.interface';
import type { ITranslationService } from '../../../domain/services/translation.service.interface';

@QueryHandler(TranslateWordInContextQuery)
export class TranslateWordInContextQueryHandler
  implements IQueryHandler<TranslateWordInContextQuery>
{
  constructor(
    @Inject(TRANSLATION_SERVICE)
    private readonly translationService: ITranslationService
  ) {}

  async execute(query: TranslateWordInContextQuery) {
    const { word, sentence } = query;
    return this.translationService.translateWordInContext(word, sentence);
  }
}
