import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReadingDashboardQuery } from './get-reading-dashboard.query';
import { Inject } from '@nestjs/common';
import { READING_REPOSITORY } from '../../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';

@QueryHandler(GetReadingDashboardQuery)
export class GetReadingDashboardQueryHandler
  implements IQueryHandler<GetReadingDashboardQuery>
{
  constructor(
    @Inject(READING_REPOSITORY)
    private readonly repository: IReadingRepository
  ) {}

  async execute(query: GetReadingDashboardQuery) {
    const { userId } = query;

    // 1. Fetch user stats
    const oldStats = await this.repository.findUserStats(userId);
    const statsEntity = await this.repository.getUserReadingStats(userId);
    const stats = {
      wordsLookedUp: oldStats.wordsLookedUp,
      totalArticles: statsEntity.getTotalArticles() > 0 ? statsEntity.getTotalArticles() : oldStats.totalArticles,
      avgWpm: statsEntity.getAvgWpm() > 0 ? statsEntity.getAvgWpm() : oldStats.avgWpm,
      masteryLevel: statsEntity.getMasteryLevel() !== 'A1' ? statsEntity.getMasteryLevel() : oldStats.masteryLevel,
    };

    // 2. Fetch trending publications (category = 'news')
    const trendingArticles = await this.repository.findArticlesByCategory('news', 3);

    // 3. Fetch Book Nook (in progress books)
    const bookProgress = await this.repository.findReadingProgressWithArticles(userId, 'book', 2);

    // If user has no books in progress, fetch some default books to display/recommend
    let books = bookProgress.map(({ progress, article }) => ({
      id: article.getId(),
      title: article.getTitle(),
      author: article.getAuthor() || 'Unknown Author',
      thumbnailUrl: article.getThumbnailUrl(),
      difficulty: article.getDifficulty().getValue(),
      progress: progress.getProgress(),
      lastPosition: progress.getLastPosition(),
      chapterInfo: progress.getLastPosition() > 0 ? `Chapter ${progress.getLastPosition()}` : 'Not started',
    }));

    if (books.length === 0) {
      const defaultBooks = await this.repository.findArticlesByCategory('book', 2);
      books = defaultBooks.map((b) => ({
        id: b.getId(),
        title: b.getTitle(),
        author: b.getAuthor() || 'Unknown Author',
        thumbnailUrl: b.getThumbnailUrl(),
        difficulty: b.getDifficulty().getValue(),
        progress: 0,
        lastPosition: 0,
        chapterInfo: 'Not started',
      }));
    }

    // 4. Fetch Blogosphere (category = 'blog')
    const blogArticles = await this.repository.findArticlesByCategory('blog', 2);

    // 5. Fetch Recent Lookups
    const recentLookups = await this.repository.findRecentLookups(userId, 5);

    // 6. Calculate Streak (Active days in reading sessions)
    const sessions = await this.repository.findReadingSessions(userId);

    const activeDates = new Set(
      sessions.map((session) => session.getStartTime().toDateString())
    );

    let streakCount = 0;
    const today = new Date();
    let currentCheck = new Date(today);

    // Check if user was active today or yesterday to continue streak
    let activeTodayOrYesterday = false;
    if (activeDates.has(today.toDateString())) {
      activeTodayOrYesterday = true;
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (activeDates.has(yesterday.toDateString())) {
        activeTodayOrYesterday = true;
        currentCheck = yesterday;
      }
    }

    if (activeTodayOrYesterday) {
      while (activeDates.has(currentCheck.toDateString())) {
        streakCount++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      }
    }

    // Weekly activity tracker (Mon - Sun status)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);

    const weeklyActivity = [];
    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    for (let i = 0; i < 7; i++) {
      const dateToCheck = new Date(startOfWeek);
      dateToCheck.setDate(startOfWeek.getDate() + i);
      const isPastOrToday = dateToCheck <= today;
      const isActive = activeDates.has(dateToCheck.toDateString());
      weeklyActivity.push({
        label: daysOfWeek[i],
        active: isActive,
        future: !isPastOrToday,
      });
    }

    // 7. Trending Topics
    const trendingTopics = [
      'Neuroscience',
      'RenewableEnergy',
      'ModernArchitecture',
      'BehavioralEconomics',
    ];

    return {
      stats,
      trendingPublications: trendingArticles.map((a) => ({
        id: a.getId(),
        title: a.getTitle(),
        difficulty: a.getDifficulty().getValue(),
        wordCount: a.getWordCount(),
        category: a.getCategory(),
        thumbnailUrl: a.getThumbnailUrl(),
        readTime: `${Math.ceil(a.getWordCount() / 200)} min read`,
      })),
      bookNook: books,
      blogosphere: blogArticles.map((a) => ({
        id: a.getId(),
        title: a.getTitle(),
        summary: a.getSummary() || 'No summary available.',
        difficulty: a.getDifficulty().getValue(),
        createdAt: (a as unknown as { _createdAt: Date })._createdAt || new Date(),
        category: a.getCategory(),
        thumbnailUrl: a.getThumbnailUrl(),
        author: a.getAuthor() || 'Unknown Author',
      })),
      recentLookups,
      readingStreak: {
        currentStreak: streakCount,
        weeklyActivity,
      },
      trendingTopics,
    };
  }
}
