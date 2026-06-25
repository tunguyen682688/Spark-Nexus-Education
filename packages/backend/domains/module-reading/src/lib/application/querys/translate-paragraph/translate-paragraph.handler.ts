import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TranslateParagraphQuery } from './translate-paragraph.query';
import { Inject } from '@nestjs/common';
import { TRANSLATION_SERVICE } from '../../../domain/services/translation.service.interface';
import type { ITranslationService } from '../../../domain/services/translation.service.interface';

@QueryHandler(TranslateParagraphQuery)
export class TranslateParagraphQueryHandler
  implements IQueryHandler<TranslateParagraphQuery>
{
  constructor(
    @Inject(TRANSLATION_SERVICE)
    private readonly translationService: ITranslationService
  ) {}

  async execute(query: TranslateParagraphQuery): Promise<string> {
    return this.translationService.translateParagraph(query.text);
  }
}
