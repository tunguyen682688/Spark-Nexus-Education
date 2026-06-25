import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCommunityArticleCommand } from './create-community-article.command';
import * as readingRepositoryInterface from '../../../domain/repositories/reading.repository.interface';
import { ArticleEntity } from '../../../domain/entities/article.entity';
import { DifficultyVO } from '../../../domain/value-objects/difficulty.vo';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(CreateCommunityArticleCommand)
export class CreateCommunityArticleHandler
  implements ICommandHandler<CreateCommunityArticleCommand>
{
  constructor(
    @Inject(readingRepositoryInterface.READING_REPOSITORY)
    private readonly readingRepository: readingRepositoryInterface.IReadingRepository
  ) {}

  async execute(command: CreateCommunityArticleCommand): Promise<string> {
    const article = ArticleEntity.create({
      id: uuidv4(),
      title: command.title,
      content: command.content,
      summary: command.summary || null,
      difficulty: DifficultyVO.create(command.difficulty || 'A1'),
      category: command.category || 'community',
      tags: command.tags || [],
      creatorId: command.userId,
      isCommunity: true,
      author: 'Community Member', // Can be populated from User profile later
    });

    // Auto publish for community articles (can be moderated later)
    article.publish();

    const saved = await this.readingRepository.saveArticle(article);
    return saved.getId();
  }
}
