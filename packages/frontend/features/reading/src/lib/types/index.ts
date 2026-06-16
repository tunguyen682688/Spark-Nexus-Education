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
  viewCount?: number;
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

// ── Content Studio Types ──────────────────────────────────────

export type ContentType = 'article' | 'book' | 'book_chapter' | 'news' | 'blog';

export type ArticleStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED';

export interface StudioFormValues {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any; // EditorJS OutputData object
  summary: string;
  contentType: ContentType;
  category: string;
  difficulty: string; // CEFR level: A1–C2
  tags: string[];
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  author: string | null;
  status: ArticleStatus;
  bookId?: string; // For book chapters
  chapterIndex?: number; // For book chapters
  targetLanguage?: string;
  audioUrl?: string | null;
  isBilingual?: boolean;
  publishedAt?: string;
}

export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  contentType: ContentType;
  defaultValues: Partial<StudioFormValues>;
}

export interface CreateArticlePayload {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any; // EditorJS OutputData or serialized string
  summary?: string;
  category: string;
  contentType?: ContentType;
  difficulty?: string;
  tags?: string[];
  thumbnailUrl?: string;
  sourceUrl?: string;
  author?: string;
  status?: ArticleStatus;
  targetLanguage?: string;
  audioUrl?: string;
  isBilingual?: boolean;
}

export interface UpdateArticlePayload extends Partial<CreateArticlePayload> {
  id: string;
}
