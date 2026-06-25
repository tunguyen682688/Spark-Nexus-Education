import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { InteractArticleCommand } from './interact-article.command';
import { READING_REPOSITORY } from '../../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';

@CommandHandler(InteractArticleCommand)
export class InteractArticleHandler implements ICommandHandler<InteractArticleCommand> {
  constructor(
    @Inject(READING_REPOSITORY)
    private readonly readingRepository: IReadingRepository,
  ) {}

  async execute(command: InteractArticleCommand): Promise<void> {
    const { userId, articleId, action } = command;

    const article = await this.readingRepository.findArticleById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with id ${articleId} not found`);
    }

    switch (action) {
      case 'UPVOTE':
        article.upvote();
        await this.readingRepository.voteArticle(userId, articleId, 1);
        await this.readingRepository.saveArticle(article);
        break;
      case 'DOWNVOTE':
        article.downvote();
        await this.readingRepository.voteArticle(userId, articleId, -1);
        await this.readingRepository.saveArticle(article);
        break;
      case 'BOOKMARK':
        await this.readingRepository.bookmarkArticle(userId, articleId);
        break;
      case 'VIEW':
        article.incrementView();
        await this.readingRepository.saveArticle(article);
        break;
    }
  }
}
