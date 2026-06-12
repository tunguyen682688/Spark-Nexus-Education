export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  difficulty: string; // A1, A2, B1, B2, C1, C2
  wordCount: number;
  category: string; // 'news', 'book', 'blog', etc.
  tags: string[];
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  author: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // User progress fields (attached on fetch if logged in)
  progress: number; // 0-100%
  lastPosition: number; // chapter info or line offset
  timeSpent: number; // seconds
  readTime?: string; // e.g. "5 min read"
}

export interface ReadingProgress {
  id: string;
  userId: string;
  articleId: string;
  progress: number;
  lastPosition: number;
  timeSpent: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserReadingStats {
  wordsLookedUp: number;
  totalArticles: number;
  avgWpm: number;
  masteryLevel: string;
}

export interface BookProgress {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string | null;
  difficulty: string;
  progress: number;
  lastPosition: number;
  chapterInfo: string;
}

export interface RecentLookupItem {
  word: string;
  definition: string | null;
  pronunciation: string | null;
}

export interface StreakDay {
  label: string; // M, T, W, T, F, S, S
  active: boolean;
  future: boolean;
}

export interface ReadingStreak {
  currentStreak: number;
  weeklyActivity: StreakDay[];
}

export interface ReadingDashboardData {
  stats: UserReadingStats;
  trendingPublications: Omit<Article, 'content' | 'summary'>[];
  bookNook: BookProgress[];
  blogosphere: Omit<Article, 'content'>[];
  recentLookups: RecentLookupItem[];
  readingStreak: ReadingStreak;
  trendingTopics: string[];
}
