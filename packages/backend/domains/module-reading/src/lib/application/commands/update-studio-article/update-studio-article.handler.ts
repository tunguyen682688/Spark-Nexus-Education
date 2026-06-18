import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UpdateStudioArticleCommand } from './update-studio-article.command';
import * as readingRepositoryInterface from '../../../domain/repositories/reading.repository.interface';
import { DifficultyVO } from '../../../domain/value-objects/difficulty.vo';

@CommandHandler(UpdateStudioArticleCommand)
export class UpdateStudioArticleHandler
  implements ICommandHandler<UpdateStudioArticleCommand>
{
  constructor(
    @Inject(readingRepositoryInterface.READING_REPOSITORY)
    private readonly readingRepository: readingRepositoryInterface.IReadingRepository
  ) {}

  async execute(command: UpdateStudioArticleCommand): Promise<string> {
    const article = await this.readingRepository.findArticleById(command.articleId);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.getCreatorId() !== command.userId) {
      throw new UnauthorizedException('You can only update your own articles');
    }

    article.updateDetails({
      title: command.title,
      content: command.content,
      summary: command.summary,
      difficulty: command.difficulty ? DifficultyVO.create(command.difficulty) : undefined,
      category: command.category,
      tags: command.tags,
      thumbnailUrl: command.thumbnailUrl,
      sourceUrl: command.sourceUrl,
      author: command.author,
      contentType: command.contentType,
    });

    if (command.status === 'PUBLISHED' && !article.getIsPublished()) {
      article.publish();
    } else if (command.status === 'DRAFT' && article.getIsPublished()) {
      article.unpublish();
    }

    await this.readingRepository.saveArticle(article);
    await this.readingRepository.syncArticleVocabulary(
      article.getId(),
      command.userId,
      article.getContent()
    );
    return article.getId();
  }
}
