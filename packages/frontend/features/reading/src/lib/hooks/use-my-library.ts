import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { readingApi } from '../api/reading-api';
import { READING_UI_TEXT } from '../constants/reading-ui-text';

export interface LibraryDashboardData {
  stats: {
    wordsLookedUp: number;
    totalArticles: number;
    avgWpm: number;
    masteryLevel: string;
  };
  inProgress: Array<{
    id: string;
    title: string;
    category: string;
    readTimeStr: string;
    progress: number;
    thumbnailUrl: string;
    type: 'LEARNING' | 'PRACTICE';
  }>;
  collections: Array<{
    id: string;
    name: string;
    articleCount: number;
    newWordCount: number;
    colorClass: string;
    icon: 'graduation' | 'flask' | 'book';
  }>;
  history: Array<{
    id: string;
    title: string;
    timeAgo: string;
    level: string;
    status: 'MASTERED' | 'LEARNING';
    thumbnailUrl: string | null;
  }>;
  sidebar: {
    streak: number;
    dailyGoal: {
      percentage: number;
      currentText: string;
      minutesLeft: number;
    };
    topGenres: Array<{
      name: string;
      percentage: number;
      colorClass: string;
    }>;
    weeklyActivity?: Array<{
      label: string;
      active: boolean;
      future: boolean;
    }>;
  };
}


export function useMyLibraryDashboard() {
  return useQuery<LibraryDashboardData>({
    queryKey: ['my-library-dashboard'],
    queryFn: async () => {
      const [dashboard, vocabPackagesRes, inProgressRes, completedRes] = await Promise.all([
        readingApi.getDashboard(),
        readingApi.getUserVocabularyPackages().catch(() => ({ data: [] })),
        readingApi.getArticles({ limit: 10, filters: { status: 'in_progress' } }).catch(() => ({ data: [] })),
        readingApi.getArticles({ limit: 5, filters: { status: 'completed' } }).catch(() => ({ data: [] })),
      ]);

      // Map stats
      const stats = {
        wordsLookedUp: dashboard.stats?.wordsLookedUp ?? 0,
        totalArticles: dashboard.stats?.totalArticles ?? 0,
        avgWpm: dashboard.stats?.avgWpm ?? 0,
        masteryLevel: dashboard.stats?.masteryLevel ?? 'A1',
      };

      // Map inProgress
      const inProgress: LibraryDashboardData['inProgress'] = [];

      const inProgressList = inProgressRes?.data || [];
      inProgressList.forEach((art) => {
        inProgress.push({
          id: art.id,
          title: art.title,
          category: art.category === 'news' ? READING_UI_TEXT.libraryStrings.CAT_NEWS : art.category === 'academic' ? READING_UI_TEXT.libraryStrings.CAT_ACADEMIC : art.category === 'book' ? READING_UI_TEXT.libraryStrings.CAT_BOOK : READING_UI_TEXT.libraryStrings.CAT_DOCUMENT,
          readTimeStr: art.readTime || READING_UI_TEXT.libraryStrings.MINUTES_READ_SUFFIX.replace('{minutes}', Math.ceil(art.wordCount / 200).toString()),
          progress: art.progress || 0,
          thumbnailUrl: art.thumbnailUrl || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80',
          type: art.category === 'book' || art.category === 'academic' ? 'LEARNING' : 'PRACTICE',
        });
      });

      // If no in progress articles found via API filter, fallback to bookNook recommendations
      if (inProgress.length === 0 && dashboard.bookNook) {
        dashboard.bookNook.forEach((book) => {
          inProgress.push({
            id: book.id,
            title: book.title,
            category: READING_UI_TEXT.libraryStrings.CAT_BOOKS_STORIES,
            readTimeStr: book.chapterInfo || READING_UI_TEXT.libraryStrings.NOT_READ_YET,
            progress: book.progress || 0,
            thumbnailUrl: book.thumbnailUrl || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80',
            type: 'LEARNING',
          });
        });
      }

      // Map collections (vocabulary sets)
      const colors = [
        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
        'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      ];
      const icons = ['graduation' as const, 'flask' as const, 'book' as const];
      
      const vocabList = vocabPackagesRes?.data || [];

      const collections = vocabList.map((pkg, idx: number) => {
        return {
          id: pkg.id || `vocab-${idx}`,
          name: pkg.title || READING_UI_TEXT.libraryStrings.DEFAULT_PACKAGE_TITLE,
          articleCount: pkg.entryCount ?? 0,
          newWordCount: pkg.entryCount ?? 0,
          colorClass: colors[idx % colors.length],
          icon: icons[idx % icons.length],
        };
      });

      // Map history (completed articles)
      const completedList = completedRes?.data || [];
      const history = completedList.map((art) => ({
        id: art.id,
        title: art.title,
        timeAgo: READING_UI_TEXT.libraryStrings.COMPLETED,
        level: art.difficulty || 'B1',
        status: 'MASTERED' as const,
        thumbnailUrl: art.thumbnailUrl,
      }));

      // Map sidebar details
      const streak = dashboard.readingStreak?.currentStreak ?? 0;
      const weeklyActivity = dashboard.readingStreak?.weeklyActivity || [];
      
      const dailyGoal = {
        percentage: streak > 0 ? 100 : 0,
        currentText: streak > 0 ? READING_UI_TEXT.libraryStrings.MINUTES_GOAL_MET : READING_UI_TEXT.libraryStrings.MINUTES_GOAL_NOT_MET,
        minutesLeft: streak > 0 ? 0 : 30,
      };

      const topGenres = [
        { name: 'Academic', percentage: 45, colorClass: 'bg-blue-600' },
        { name: 'Science', percentage: 30, colorClass: 'bg-blue-400' },
        { name: 'Literature', percentage: 25, colorClass: 'bg-red-500' },
      ];

      return {
        stats,
        inProgress,
        collections,
        history,
        sidebar: {
          streak,
          dailyGoal,
          topGenres,
          weeklyActivity,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyCreatedArticles() {
  return useQuery({
    queryKey: ['my-created-articles'],
    queryFn: async () => {
      const res = await readingApi.getMyArticles({ limit: 100 });
      return res.data;
    },
  });
}

export function useDeleteMyArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => readingApi.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-created-articles'] });
      queryClient.invalidateQueries({ queryKey: ['my-library-dashboard'] });
    },
  });
}
