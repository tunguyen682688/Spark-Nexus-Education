import { ArticleEntity } from '../entities/article.entity';
import { ReadingProgressEntity } from '../entities/reading-progress.entity';
import { ReadingSessionEntity } from '../entities/reading-session.entity';
import { UserReadingStatsEntity } from '../entities/user-reading-stats.entity';
import { ArticleCommentEntity } from '../entities/article-comment.entity';
import { QueryParams } from '@spark-nest-ed/shared-libs';

export const READING_REPOSITORY = Symbol('READING_REPOSITORY');

export interface IReadingRepository {
  findArticles(queryParams?: QueryParams): Promise<{
    items: ArticleEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  findArticleById(id: string): Promise<ArticleEntity | null>;

  saveArticle(article: ArticleEntity): Promise<ArticleEntity>;

  deleteArticle(id: string): Promise<void>;

  findArticlesByCreatorId(creatorId: string, limit?: number): Promise<ArticleEntity[]>;

  findCommunityArticles(sortBy: 'trending' | 'newest' | 'top', limit?: number): Promise<ArticleEntity[]>;

  voteArticle(userId: string, articleId: string, voteType: 1 | -1): Promise<void>;

  addComment(comment: ArticleCommentEntity): Promise<ArticleCommentEntity>;

  bookmarkArticle(userId: string, articleId: string): Promise<void>;

  findReadingProgress(
    userId: string,
    articleId: string
  ): Promise<ReadingProgressEntity | null>;

  saveReadingProgress(
    progress: ReadingProgressEntity
  ): Promise<ReadingProgressEntity>;

  findReadingProgressByUserId(
    userId: string
  ): Promise<ReadingProgressEntity[]>;

  getUserReadingStats(userId: string): Promise<UserReadingStatsEntity>;

  saveUserReadingStats(stats: UserReadingStatsEntity): Promise<UserReadingStatsEntity>;

  saveReadingSession(session: ReadingSessionEntity): Promise<ReadingSessionEntity>;

  findReadingSessions(userId: string, startDate?: Date, endDate?: Date): Promise<ReadingSessionEntity[]>;

  findUserStats(userId: string): Promise<{
    wordsLookedUp: number;
    totalArticles: number;
    avgWpm: number;
    masteryLevel: string;
  }>;

  findRecentLookups(userId: string, limit?: number): Promise<Array<{
    word: string;
    definition: string | null;
    pronunciation: string | null;
  }>>;

  // Decoupled repository operations
  findArticlesByCategory(category: string, limit: number): Promise<ArticleEntity[]>;

  findReadingProgressWithArticles(
    userId: string,
    category: string,
    limit: number
  ): Promise<Array<{ progress: ReadingProgressEntity; article: ArticleEntity }>>;

  findReadingProgressUpdates(userId: string): Promise<Date[]>;

  findReadingProgressByProgressRange(
    userId: string,
    minProgress: number,
    maxProgress: number
  ): Promise<ReadingProgressEntity[]>;

  findReadingProgressForArticles(
    userId: string,
    articleIds: string[]
  ): Promise<ReadingProgressEntity[]>;

  syncArticleVocabulary(
    articleId: string,
    creatorId: string,
    content: string
  ): Promise<void>;
}
