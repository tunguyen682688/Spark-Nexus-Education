import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMyArticlesQuery } from './get-my-articles.query';
import * as readingRepositoryInterface from '../../../domain/repositories/reading.repository.interface';
import { ArticleEntity } from '../../../domain/entities/article.entity';

@QueryHandler(GetMyArticlesQuery)
export class GetMyArticlesHandler implements IQueryHandler<GetMyArticlesQuery> {
  constructor(
    @Inject(readingRepositoryInterface.READING_REPOSITORY)
    private readonly readingRepository: readingRepositoryInterface.IReadingRepository
  ) {}

  async execute(query: GetMyArticlesQuery): Promise<{ data: ArticleEntity[]; meta: Record<string, unknown> }> {
    const articles = await this.readingRepository.findArticlesByCreatorId(query.userId, query.limit);

    // Manual pagination/meta for simplicity, can be improved later
    const meta = {
      page: query.page,
      limit: query.limit,
      total: articles.length,
      totalPages: 1,
    };

    return {
      data: articles,
      meta,
    };
  }
}
