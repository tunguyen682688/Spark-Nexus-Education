import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { ArticleEntity } from '../../domain/entities/article.entity';
import { ReadingProgressEntity } from '../../domain/entities/reading-progress.entity';
import { ReadingSessionEntity } from '../../domain/entities/reading-session.entity';
import { UserReadingStatsEntity } from '../../domain/entities/user-reading-stats.entity';
import { ArticleCommentEntity } from '../../domain/entities/article-comment.entity';
import { IReadingRepository } from '../../domain/repositories/reading.repository.interface';
import { Prisma } from '@prisma/client';
import {
  buildPrismaQuery,
  normalizeQueryParams,
  extractPagination,
  sanitizeLimit,
  sanitizePage,
  PagePagination,
  OffsetPagination,
  QueryParams,
} from '@spark-nest-ed/shared-libs';

@Injectable()
export class ReadingRepository implements IReadingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findArticles(queryParams?: QueryParams) {
    const normalizedParams = normalizeQueryParams(queryParams || {}) as Record<
      string,
      unknown
    >;

    // Base filters: published articles only
    const baseWhere: Record<string, unknown> = {
      isPublished: true,
    };

    // If query has specific parameters, mapping them
    const prismaQuery = buildPrismaQuery(normalizedParams, {
      maxLimit: 100,
      defaultLimit: 20,
    });

    const where: Record<string, unknown> =
      prismaQuery.where && Object.keys(prismaQuery.where).length > 0
        ? {
            AND: [baseWhere, prismaQuery.where],
          }
        : { ...baseWhere };

    // Check if there is full-text search
    if (normalizedParams.q || normalizedParams.search) {
      const searchTerm = (normalizedParams.q ||
        normalizedParams.search) as string;
      where['OR'] = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy =
      prismaQuery.orderBy &&
      (Array.isArray(prismaQuery.orderBy)
        ? prismaQuery.orderBy.length > 0
        : Object.keys(prismaQuery.orderBy).length > 0)
        ? prismaQuery.orderBy
        : [{ createdAt: 'desc' }];

    const pagination = extractPagination(normalizedParams);
    let page = 1;
    let limit = 20;

    if (pagination && 'page' in pagination) {
      const pagePagination = pagination as PagePagination;
      page = sanitizePage(pagePagination.page);
      limit = sanitizeLimit(pagePagination.pageSize, 100, 20);
    } else if (pagination && 'offset' in pagination) {
      const offsetPagination = pagination as OffsetPagination;
      limit = sanitizeLimit(offsetPagination.limit, 100, 20);
      page = Math.floor(offsetPagination.offset / Math.max(limit, 1)) + 1;
    } else {
      limit = prismaQuery.take || 20;
    }

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy,
        skip: prismaQuery.skip,
        take: prismaQuery.take,
      }),
      this.prisma.article.count({ where }),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      items: items.map((item) => ArticleEntity.fromPersistence(item)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findArticleById(id: string): Promise<ArticleEntity | null> {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });
    return article ? ArticleEntity.fromPersistence(article) : null;
  }

  async findReadingProgress(
    userId: string,
    articleId: string
  ): Promise<ReadingProgressEntity | null> {
    const progress = await this.prisma.readingProgress.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
    return progress ? ReadingProgressEntity.fromPersistence(progress) : null;
  }

  async saveReadingProgress(
    progress: ReadingProgressEntity
  ): Promise<ReadingProgressEntity> {
    const data = progress.toPersistence();
    const saved = await this.prisma.readingProgress.upsert({
      where: {
        userId_articleId: {
          userId: data.userId,
          articleId: data.articleId,
        },
      },
      update: {
        progress: data.progress,
        lastPosition: data.lastPosition,
        timeSpent: data.timeSpent,
        completedAt: data.completedAt,
      },
      create: {
        userId: data.userId,
        articleId: data.articleId,
        progress: data.progress,
        lastPosition: data.lastPosition,
        timeSpent: data.timeSpent,
        completedAt: data.completedAt,
      },
    });

    return ReadingProgressEntity.fromPersistence(saved);
  }

  async findReadingProgressByUserId(
    userId: string
  ): Promise<ReadingProgressEntity[]> {
    const progressList = await this.prisma.readingProgress.findMany({
      where: { userId },
    });
    return progressList.map((progress) =>
      ReadingProgressEntity.fromPersistence(progress)
    );
  }

  async getUserReadingStats(userId: string): Promise<UserReadingStatsEntity> {
    const stats = await this.prisma.userReadingStats.findUnique({
      where: { userId },
    });
    if (!stats) {
      return UserReadingStatsEntity.create(userId);
    }
    return UserReadingStatsEntity.fromPersistence(stats);
  }

  async saveUserReadingStats(
    stats: UserReadingStatsEntity
  ): Promise<UserReadingStatsEntity> {
    const data = stats.toPersistence();
    const saved = await this.prisma.userReadingStats.upsert({
      where: { userId: data.userId },
      update: {
        totalArticles: data.totalArticles,
        totalWords: data.totalWords,
        totalTime: data.totalTime,
        avgWpm: data.avgWpm,
        masteryLevel: data.masteryLevel,
        currentStreak: data.currentStreak,
        lastActiveAt: data.lastActiveAt,
      },
      create: {
        userId: data.userId,
        totalArticles: data.totalArticles,
        totalWords: data.totalWords,
        totalTime: data.totalTime,
        avgWpm: data.avgWpm,
        masteryLevel: data.masteryLevel,
        currentStreak: data.currentStreak,
        lastActiveAt: data.lastActiveAt,
      },
    });
    return UserReadingStatsEntity.fromPersistence(saved);
  }

  async saveReadingSession(
    session: ReadingSessionEntity
  ): Promise<ReadingSessionEntity> {
    const data = session.toPersistence();
    const saved = await this.prisma.readingSession.create({
      data: {
        id: data.id,
        userId: data.userId,
        articleId: data.articleId,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        wordsRead: data.wordsRead,
        createdAt: data.createdAt,
      },
    });
    return ReadingSessionEntity.fromPersistence(saved);
  }

  async findReadingSessions(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ReadingSessionEntity[]> {
    const where: Prisma.ReadingSessionWhereInput = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }
    const sessions = await this.prisma.readingSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return sessions.map((s) => ReadingSessionEntity.fromPersistence(s));
  }

  async findUserStats(userId: string) {
    // 1. Words Looked Up count
    const wordsLookedUp = await this.prisma.userVocabularyProgress.count({
      where: { userId },
    });

    // 2. Total Articles read (completed progress = 100)
    const totalArticles = await this.prisma.readingProgress.count({
      where: {
        userId,
        progress: 100,
      },
    });

    // 3. Average Reading Speed (WPM)
    // Find all completed reading progress for the user
    const completedProgress = await this.prisma.readingProgress.findMany({
      where: {
        userId,
        progress: 100,
      },
      include: {
        article: true,
      },
    });

    let avgWpm = 245; // Default from mockup design if no logs exist
    if (completedProgress.length > 0) {
      let totalWords = 0;
      let totalTimeSeconds = 0;
      for (const progress of completedProgress) {
        totalWords += progress.article.wordCount;
        totalTimeSeconds += progress.timeSpent;
      }
      if (totalTimeSeconds > 0) {
        const totalMinutes = totalTimeSeconds / 60;
        avgWpm = Math.round(totalWords / totalMinutes);
      }
    }

    // 4. Mastery Level based on highest completed CEFR level article
    // Default to B2 as shown in design or user progress
    let masteryLevel = 'B2';
    const cefrRanks: Record<string, number> = {
      A1: 1,
      A2: 2,
      B1: 3,
      B2: 4,
      C1: 5,
      C2: 6,
    };
    if (completedProgress.length > 0) {
      let maxRank = 0;
      for (const progress of completedProgress) {
        const diff = progress.article.difficulty.toUpperCase();
        const rank = cefrRanks[diff] || 0;
        if (rank > maxRank) {
          maxRank = rank;
          masteryLevel = diff;
        }
      }
    }

    return {
      wordsLookedUp,
      totalArticles,
      avgWpm,
      masteryLevel,
    };
  }

  async findRecentLookups(userId: string, limit = 5) {
    // Query user vocabulary progress ordered by updatedAt desc
    const lookups = await this.prisma.userVocabularyProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        item: {
          include: {
            entry: true,
          },
        },
      },
    });

    return lookups.map((lookup) => ({
      word: lookup.item.word,
      definition: lookup.item.definition || lookup.item.entry.notes || null,
      pronunciation: lookup.item.entry.pronunciation || null,
    }));
  }

  async findArticlesByCategory(
    category: string,
    limit: number
  ): Promise<ArticleEntity[]> {
    const records = await this.prisma.article.findMany({
      where: {
        isPublished: true,
        category,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return records.map((record) => ArticleEntity.fromPersistence(record));
  }

  async findReadingProgressWithArticles(
    userId: string,
    category: string,
    limit: number
  ): Promise<
    Array<{ progress: ReadingProgressEntity; article: ArticleEntity }>
  > {
    const records = await this.prisma.readingProgress.findMany({
      where: {
        userId,
        article: {
          category,
        },
      },
      include: {
        article: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return records.map((record) => ({
      progress: ReadingProgressEntity.fromPersistence(record),
      article: ArticleEntity.fromPersistence(record.article),
    }));
  }

  async findReadingProgressUpdates(userId: string): Promise<Date[]> {
    const records = await this.prisma.readingProgress.findMany({
      where: { userId },
      select: { updatedAt: true },
    });
    return records.map((record) => record.updatedAt);
  }

  async findReadingProgressByProgressRange(
    userId: string,
    minProgress: number,
    maxProgress: number
  ): Promise<ReadingProgressEntity[]> {
    const records = await this.prisma.readingProgress.findMany({
      where: {
        userId,
        progress: {
          gte: minProgress,
          lte: maxProgress,
        },
      },
    });
    return records.map((record) =>
      ReadingProgressEntity.fromPersistence(record)
    );
  }

  async findReadingProgressForArticles(
    userId: string,
    articleIds: string[]
  ): Promise<ReadingProgressEntity[]> {
    const records = await this.prisma.readingProgress.findMany({
      where: {
        userId,
        articleId: { in: articleIds },
      },
    });
    return records.map((record) =>
      ReadingProgressEntity.fromPersistence(record)
    );
  }

  // ==========================================
  // Community Methods
  // ==========================================

  async saveArticle(article: ArticleEntity): Promise<ArticleEntity> {
    const data = article.toPersistence();
    const saved = await this.prisma.article.upsert({
      where: { id: article.getId() },
      update: data,
      create: data,
    });
    return ArticleEntity.fromPersistence(saved);
  }

  async findCommunityArticles(
    sortBy: 'trending' | 'newest' | 'top',
    limit = 10
  ): Promise<ArticleEntity[]> {
    let orderBy:
      | Prisma.ArticleOrderByWithRelationInput
      | Prisma.ArticleOrderByWithRelationInput[] = { createdAt: 'desc' };
    if (sortBy === 'top') {
      orderBy = { upvotes: 'desc' };
    } else if (sortBy === 'trending') {
      orderBy = [{ viewCount: 'desc' }, { upvotes: 'desc' }];
    }

    const records = await this.prisma.article.findMany({
      where: { isCommunity: true, isPublished: true },
      orderBy,
      take: limit,
    });

    return records.map((record) => ArticleEntity.fromPersistence(record));
  }

  async voteArticle(
    userId: string,
    articleId: string,
    voteType: 1 | -1
  ): Promise<void> {
    await this.prisma.articleVote.upsert({
      where: { userId_articleId: { userId, articleId } },
      update: { vote: voteType },
      create: { userId, articleId, vote: voteType },
    });
  }

  async addComment(
    comment: ArticleCommentEntity
  ): Promise<ArticleCommentEntity> {
    const data = comment.toPersistence();
    const saved = await this.prisma.articleComment.create({
      data,
    });
    return ArticleCommentEntity.fromPersistence(saved);
  }

  async bookmarkArticle(userId: string, articleId: string): Promise<void> {
    await this.prisma.userArticleBookmark.upsert({
      where: { userId_articleId: { userId, articleId } },
      update: {},
      create: { userId, articleId },
    });
  }
}
