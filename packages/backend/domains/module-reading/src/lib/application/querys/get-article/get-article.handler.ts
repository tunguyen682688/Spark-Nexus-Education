import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetArticleQuery } from './get-article.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { READING_REPOSITORY } from '../../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';

@QueryHandler(GetArticleQuery)
export class GetArticleQueryHandler implements IQueryHandler<GetArticleQuery> {
  constructor(
    @Inject(READING_REPOSITORY)
    private readonly repository: IReadingRepository
  ) {}

  async execute(query: GetArticleQuery) {
    const { id, userId } = query;

    const article = await this.repository.findArticleById(id);
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    let progress = 0;
    let lastPosition = 0;
    let timeSpent = 0;

    if (userId) {
      const userProgress = await this.repository.findReadingProgress(userId, id);
      if (userProgress) {
        progress = userProgress.getProgress();
        lastPosition = userProgress.getLastPosition();
        timeSpent = userProgress.getTimeSpent();
      }
    }

    return {
      ...article.toPersistence(),
      progress,
      lastPosition,
      timeSpent,
      readTime: `${Math.ceil(article.getWordCount() / 200)} min read`,
    };
  }
}
