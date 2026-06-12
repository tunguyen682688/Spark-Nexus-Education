import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCommunityArticlesQuery } from './get-community-articles.query';
import { READING_REPOSITORY } from '../../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';

@QueryHandler(GetCommunityArticlesQuery)
export class GetCommunityArticlesHandler implements IQueryHandler<GetCommunityArticlesQuery> {
  constructor(
    @Inject(READING_REPOSITORY)
    private readonly readingRepository: IReadingRepository,
  ) {}

  async execute(query: GetCommunityArticlesQuery) {
    const articles = await this.readingRepository.findCommunityArticles(query.sortBy, query.limit);

    // If userId is provided, we could also attach user-specific data like hasBookmarked, hasUpvoted, etc.
    // For now, return domain objects mapped to DTO
    return articles.map(article => ({
      ...article.toPlainObject(),
      // Add more specific computed fields if needed
    }));
  }
}
