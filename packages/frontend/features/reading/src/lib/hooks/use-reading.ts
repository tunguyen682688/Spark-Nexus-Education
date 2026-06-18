import { useQuery, useMutation, useQueryClient, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { readingApi } from '../api/reading-api';
import type { ApiQueryParams, SimplifiedPaginatedResponse } from '@spark-nest-ed/frontend-core-api';
import type { Article } from '../types';

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
    placeholderData: keepPreviousData,
  });
}

export function useInfiniteArticles(params?: ApiQueryParams) {
  return useInfiniteQuery<SimplifiedPaginatedResponse<Article>>({
    queryKey: [...readingKeys.all, 'list', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      readingApi.getArticles({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.data || lastPage.data.length === 0) {
        return undefined;
      }
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1 * 60 * 1000, // 1 minute cache
    placeholderData: keepPreviousData,
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
    placeholderData: keepPreviousData,
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

export function useVocabularyEntryDetail(word: string | null | undefined) {
  return useQuery({
    queryKey: ['vocabulary', 'entry', word?.toLowerCase().trim() ?? ''],
    queryFn: () => readingApi.getEntryDetail(word as string),
    enabled: !!word && word.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useContextTranslation(word: string | null | undefined, sentence: string | null | undefined) {
  return useQuery({
    queryKey: ['reading', 'translate-context', word?.toLowerCase().trim() ?? '', sentence?.trim() ?? ''],
    queryFn: () => readingApi.translateContext(word as string, sentence as string),
    enabled: !!word && !!sentence && word.trim().length > 0 && sentence.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserVocabularyPackages() {
  return useQuery({
    queryKey: ['vocabulary', 'my-packages'],
    queryFn: () => readingApi.getUserVocabularyPackages(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddWordToPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ packageId, payload }: { packageId: string; payload: any }) =>
      readingApi.addWordToPackage(packageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'my-packages'],
      });
    },
  });
}
