import { ICommand } from '@nestjs/cqrs';
import { ArticleHighlightDto } from '../../dtos/article-highlight.dto';

export class UpdateStudioArticleCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly articleId: string,
    public readonly title?: string,
    public readonly content?: string,
    public readonly category?: string,
    public readonly summary?: string,
    public readonly difficulty?: string,
    public readonly tags?: string[],
    public readonly thumbnailUrl?: string,
    public readonly sourceUrl?: string,
    public readonly author?: string,
    public readonly status?: string,
    public readonly contentType?: string,
    public readonly vocabularySetId?: string,
    public readonly highlights?: ArticleHighlightDto[]
  ) {}
}

