import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AddArticleCommentCommand } from './add-article-comment.command';
import { READING_REPOSITORY } from '../../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';
import { ArticleCommentEntity } from '../../../domain/entities/article-comment.entity';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(AddArticleCommentCommand)
export class AddArticleCommentHandler implements ICommandHandler<AddArticleCommentCommand> {
  constructor(
    @Inject(READING_REPOSITORY)
    private readonly readingRepository: IReadingRepository,
  ) {}

  async execute(command: AddArticleCommentCommand): Promise<string> {
    const article = await this.readingRepository.findArticleById(command.articleId);
    if (!article) {
      throw new NotFoundException(`Article with id ${command.articleId} not found`);
    }

    const comment = ArticleCommentEntity.create({
      id: uuidv4(),
      articleId: command.articleId,
      userId: command.userId,
      content: command.content,
    });

    const saved = await this.readingRepository.addComment(comment);
    return saved.getId();
  }
}
