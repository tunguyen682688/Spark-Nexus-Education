import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateStudioArticleCommand } from './create-studio-article.command';
import * as readingRepositoryInterface from '../../../domain/repositories/reading.repository.interface';
import { ArticleEntity } from '../../../domain/entities/article.entity';
import { DifficultyVO } from '../../../domain/value-objects/difficulty.vo';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(CreateStudioArticleCommand)
export class CreateStudioArticleHandler
  implements ICommandHandler<CreateStudioArticleCommand>
{
  constructor(
    @Inject(readingRepositoryInterface.READING_REPOSITORY)
    private readonly readingRepository: readingRepositoryInterface.IReadingRepository
  ) {}

  async execute(command: CreateStudioArticleCommand): Promise<string> {
    const article = ArticleEntity.create({
      id: uuidv4(),
      title: command.title,
      content: command.content,
      summary: command.summary || null,
      difficulty: DifficultyVO.create(command.difficulty || 'A1'),
      category: command.category,
      tags: command.tags || [],
      thumbnailUrl: command.thumbnailUrl || null,
      sourceUrl: command.sourceUrl || null,
      author: command.author || null,
      creatorId: command.userId,
      isCommunity: true,
      contentType: command.contentType,
      vocabularySetId: command.vocabularySetId || null,
    });

    if (command.status === 'PUBLISHED') {
      article.publish();
    }

    const saved = await this.readingRepository.saveArticle(article);
    if (command.highlights) {
      await this.readingRepository.syncArticleHighlights(
        saved.getId(),
        command.userId,
        command.highlights
      );
    } else {
      await this.readingRepository.syncArticleVocabulary(
        saved.getId(),
        command.userId,
        saved.getContent()
      );
    }
    return saved.getId();
  }
}
