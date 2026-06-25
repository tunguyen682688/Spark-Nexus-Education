import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetArticlesQuery } from './get-articles.query';
import { Inject } from '@nestjs/common';
import { READING_REPOSITORY } from '../../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';
import { FilterOperator, QueryParams } from '@spark-nest-ed/shared-libs';
import { ArticleEntity } from '../../../domain/entities/article.entity';

interface ReadingQueryParams extends QueryParams {
  status?: string;
  id?: { in: string[] };
}

export type ArticleWithProgress = ReturnType<ArticleEntity['toPersistence']> & {
  progress: number;
  lastPosition: number;
  timeSpent: number;
  readTime: string;
};


@QueryHandler(GetArticlesQuery)
export class GetArticlesQueryHandler implements IQueryHandler<GetArticlesQuery> {
  constructor(
    @Inject(READING_REPOSITORY)
    private readonly repository: IReadingRepository
  ) {}

  async execute(query: GetArticlesQuery): Promise<{
    data: ArticleWithProgress[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { queryParams = {}, userId } = query;
    const filters = { ...queryParams } as ReadingQueryParams;

    let articleIdsFilter: string[] | null = null;

    // Handle status filtering: 'in_progress', 'completed'
    if (userId && filters.status) {
      const statusValue = String(filters.status).toLowerCase();
      delete filters.status; // Remove it from raw database filter since it's a domain/join filter

      if (statusValue === 'in_progress') {
        const progressList = await this.repository.findReadingProgressByProgressRange(userId, 1, 99);
        articleIdsFilter = progressList.map((p) => p.getArticleId());
      } else if (statusValue === 'completed') {
        const progressList = await this.repository.findReadingProgressByProgressRange(userId, 100, 100);
        articleIdsFilter = progressList.map((p) => p.getArticleId());
      }

      // If filtering by status yielded no articles, return empty list
      if (articleIdsFilter && articleIdsFilter.length === 0) {
        return {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          },
        };
      }
    }

    // Set article ID query filter if it exists
    if (articleIdsFilter) {
      filters.filters = filters.filters || [];
      if (Array.isArray(filters.filters)) {
        filters.filters.push({
          field: 'id',
          operator: FilterOperator.IN,
          value: articleIdsFilter,
        });
      } else {
        filters.id = { in: articleIdsFilter };
      }
    }

    // Find the articles
    const result = await this.repository.findArticles(filters);

    // If user is authenticated, retrieve progress for all returned articles and attach them
    let data: ArticleWithProgress[];
    if (userId && result.items.length > 0) {
      const persistedItems = result.items.map((entity) => entity.toPersistence());
      const articleIds = persistedItems.map((d) => d.id);
      const userProgressList = await this.repository.findReadingProgressForArticles(userId, articleIds);

      const progressMap = new Map(userProgressList.map((p) => [p.getArticleId(), p]));

      data = persistedItems.map((item) => {
        const prog = progressMap.get(item.id);
        return {
          ...item,
          progress: prog ? prog.getProgress() : 0,
          lastPosition: prog ? prog.getLastPosition() : 0,
          timeSpent: prog ? prog.getTimeSpent() : 0,
          readTime: `${Math.ceil(item.wordCount / 200)} min read`,
        };
      });
    } else {
      data = result.items.map((entity) => {
        const item = entity.toPersistence();
        return {
          ...item,
          progress: 0,
          lastPosition: 0,
          timeSpent: 0,
          readTime: `${Math.ceil(item.wordCount / 200)} min read`,
        };
      });
    }

    return {
      data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}

