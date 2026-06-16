import { GetArticlesQueryHandler } from './get-articles.handler';
import { GetArticlesQuery } from './get-articles.query';
import { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';
import { ArticleEntity } from '../../../domain/entities/article.entity';
import { ReadingProgressEntity } from '../../../domain/entities/reading-progress.entity';

describe('GetArticlesQueryHandler', () => {
  let handler: GetArticlesQueryHandler;
  let repository: jest.Mocked<IReadingRepository>;

  const mockArticleEntity = ArticleEntity.fromPersistence({
    id: 'article-1',
    title: 'Test Article',
    content: 'Some test content here.',
    summary: 'Summary',
    difficulty: 'B1',
    wordCount: 4,
    category: 'blog',
    tags: ['test'],
    thumbnailUrl: null,
    sourceUrl: null,
    author: null,
    creatorId: null,
    upvotes: 0,
    downvotes: 0,
    viewCount: 0,
    isCommunity: false,
    isPublished: true,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockProgressEntity = ReadingProgressEntity.fromPersistence({
    id: 'progress-1',
    userId: 'user-1',
    articleId: 'article-1',
    progress: 50,
    lastPosition: 10,
    timeSpent: 120,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    repository = {
      findArticles: jest.fn(),
      findArticleById: jest.fn(),
      findReadingProgress: jest.fn(),
      saveReadingProgress: jest.fn(),
      findReadingProgressByUserId: jest.fn(),
      findUserStats: jest.fn(),
      findRecentLookups: jest.fn(),
      findArticlesByCategory: jest.fn(),
      findReadingProgressWithArticles: jest.fn(),
      findReadingProgressUpdates: jest.fn(),
      findReadingProgressByProgressRange: jest.fn(),
      findReadingProgressForArticles: jest.fn(),
    } as unknown as jest.Mocked<IReadingRepository>;

    handler = new GetArticlesQueryHandler(repository);
  });

  it('should return articles without progress if userId is not provided', async () => {
    repository.findArticles.mockResolvedValue({
      items: [mockArticleEntity],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    const query = new GetArticlesQuery({});
    const result = await handler.execute(query);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('article-1');
    expect(result.data[0].progress).toBe(0);
    expect(result.data[0].readTime).toBe('1 min read');
  });

  it('should return articles with progress if userId is provided', async () => {
    repository.findArticles.mockResolvedValue({
      items: [mockArticleEntity],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    repository.findReadingProgressForArticles.mockResolvedValue([mockProgressEntity]);

    const query = new GetArticlesQuery({}, 'user-1');
    const result = await handler.execute(query);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('article-1');
    expect(result.data[0].progress).toBe(50);
    expect(result.data[0].lastPosition).toBe(10);
    expect(result.data[0].readTime).toBe('1 min read');
  });

  it('should handle status filter for in_progress status', async () => {
    repository.findReadingProgressByProgressRange.mockResolvedValue([mockProgressEntity]);
    repository.findArticles.mockResolvedValue({
      items: [mockArticleEntity],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    repository.findReadingProgressForArticles.mockResolvedValue([mockProgressEntity]);

    const query = new GetArticlesQuery({ status: 'in_progress' }, 'user-1');
    const result = await handler.execute(query);

    expect(repository.findReadingProgressByProgressRange).toHaveBeenCalledWith('user-1', 1, 99);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].progress).toBe(50);
  });

  it('should return empty list if status filtering returns no progress records', async () => {
    repository.findReadingProgressByProgressRange.mockResolvedValue([]);

    const query = new GetArticlesQuery({ status: 'in_progress' }, 'user-1');
    const result = await handler.execute(query);

    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });
});
