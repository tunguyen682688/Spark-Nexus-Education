import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { readingApi } from '../api/reading-api';
import type { ApiQueryParams } from '@spark-nest-ed/frontend-core-api';

export const readingKeys = {
  all: ['reading'] as const,
  dashboard: () => [...readingKeys.all, 'dashboard'] as const,
  articlesList: (params?: ApiQueryParams) => [...readingKeys.all, 'list', params] as const,
  communityArticlesList: (sortBy: string, limit: number) => [...readingKeys.all, 'community-list', sortBy, limit] as const,
  articleDetail: (id: string) => [...readingKeys.all, 'detail', id] as const,
};

export function useReadingDashboard() {
  return useQuery({
    queryKey: readingKeys.dashboard(),
    queryFn: () => readingApi.getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useArticles(params?: ApiQueryParams) {
  return useQuery({
    queryKey: readingKeys.articlesList(params),
    queryFn: () => readingApi.getArticles(params),
    staleTime: 1 * 60 * 1000, // 1 minute cache
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: readingKeys.articleDetail(id),
    queryFn: () => readingApi.getArticle(id),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: !!id,
  });
}

export function useUpdateReadingProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      progress,
      lastPosition,
      timeSpent,
    }: {
      id: string;
      progress: number;
      lastPosition: number;
      timeSpent: number;
    }) => readingApi.updateProgress(id, { progress, lastPosition, timeSpent }),
    onSuccess: (data, variables) => {
      // Invalidate detail cache for this article
      queryClient.invalidateQueries({
        queryKey: readingKeys.articleDetail(variables.id),
      });
      // Invalidate dashboard to update progress stats / books being read
      queryClient.invalidateQueries({
        queryKey: readingKeys.dashboard(),
      });
      // Invalidate articles list to reflect changes in progress bar
      queryClient.invalidateQueries({
        queryKey: readingKeys.all,
      });
    },
  });
}

export function useCommunityArticles(sortBy: 'trending' | 'newest' | 'top' = 'trending', limit = 10) {
  return useQuery({
    queryKey: readingKeys.communityArticlesList(sortBy, limit),
    queryFn: () => readingApi.getCommunityArticles(sortBy, limit),
    staleTime: 1 * 60 * 1000, // 1 minute cache
  });
}

export function useInteractArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'UPVOTE' | 'DOWNVOTE' | 'BOOKMARK' }) =>
      readingApi.interactArticle(id, action),
    onSuccess: (data, variables) => {
      // Invalidate specific article cache
      queryClient.invalidateQueries({
        queryKey: readingKeys.articleDetail(variables.id),
      });
      // Invalidate community articles to update upvote counts
      queryClient.invalidateQueries({
        queryKey: readingKeys.all, // Broad invalidation to catch all community lists
      });
    },
  });
}
