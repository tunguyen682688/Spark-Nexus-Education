import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { listeningApi } from '../api/listening-api';
import { ListeningMaterial } from '../types';
import { useToast } from '@spark-nest-ed/frontend-shared-components';

// =============================================================================
// Query Key Factory
// =============================================================================

export const listeningKeys = {
  root: ['listening'] as const,
  materials: () => [...listeningKeys.root, 'materials'] as const,
  list: (params?: unknown) => [...listeningKeys.materials(), 'list', params] as const,
  infiniteList: (params?: unknown) => [...listeningKeys.materials(), 'infinite', params] as const,
  detail: (id: string) => [...listeningKeys.materials(), 'detail', id] as const,
  userStats: () => [...listeningKeys.root, 'user-stats'] as const,
  weeklyActivity: () => [...listeningKeys.root, 'weekly-activity'] as const,
  leaderboard: (limit?: number) => [...listeningKeys.root, 'leaderboard', limit] as const,
} as const;

export function useListeningMaterials(params?: {
  category?: string;
  difficulty?: string;
  isCommunity?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: listeningKeys.list(params),
    queryFn: () => listeningApi.getListeningMaterials(params),
  });
}

export function useInfiniteListeningMaterials(params?: {
  category?: string;
  difficulty?: string;
  isCommunity?: boolean;
  q?: string;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: listeningKeys.infiniteList(params),
    queryFn: ({ pageParam = 1 }) =>
      listeningApi.getListeningMaterials({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useListeningMaterialDetail(id: string) {
  return useQuery({
    queryKey: listeningKeys.detail(id),
    queryFn: () => listeningApi.getListeningMaterialDetail(id),
    enabled: !!id,
  });
}

export function useUpdateListeningProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      progress,
      lastPosition,
      timeSpent,
      completed,
    }: {
      id: string;
      progress: number;
      lastPosition: number;
      timeSpent: number;
      completed?: boolean;
    }) =>
      listeningApi.updateListeningProgress(
        id,
        progress,
        lastPosition,
        timeSpent,
        completed
      ),
    onSuccess: (_, variables) => {
      // Update detailed query cache locally immediately
      queryClient.setQueryData(listeningKeys.detail(variables.id), (old: ListeningMaterial | undefined) => {
        if (!old) return old;
        const currentProgress = old.userProgress || { progress: 0, lastPosition: 0, timeSpent: 0 };
        return {
          ...old,
          userProgress: {
            ...currentProgress,
            progress: variables.progress,
            lastPosition: variables.lastPosition,
            timeSpent: currentProgress.timeSpent + variables.timeSpent,
            completedAt: variables.completed ? new Date().toISOString() : currentProgress.completedAt,
          },
        };
      });

      // Database-wide lists and dashboard metrics are only invalidated upon complete status
      if (variables.completed) {
        queryClient.invalidateQueries({
          queryKey: listeningKeys.materials(),
        });
        queryClient.invalidateQueries({
          queryKey: listeningKeys.userStats(),
        });
        queryClient.invalidateQueries({
          queryKey: listeningKeys.weeklyActivity(),
        });
      }
    },
  });
}

export function useVoteListeningMaterial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, vote }: { id: string; vote: number }) =>
      listeningApi.voteListeningMaterial(id, vote),
    onMutate: async ({ id, vote }) => {
      // Cancel outgoing refetches to prevent overwriting
      await queryClient.cancelQueries({ queryKey: listeningKeys.detail(id) });

      // Snapshot previous value
      const previousDetail = queryClient.getQueryData<ListeningMaterial>(listeningKeys.detail(id));

      // Optimistically update
      if (previousDetail) {
        queryClient.setQueryData(listeningKeys.detail(id), (old: ListeningMaterial | undefined) => {
          if (!old) return old;
          
          const oldVote = old.userVote || 0;
          let newUpvotes = old.upvotes || 0;
          let newDownvotes = old.downvotes || 0;

          // Subtract previous vote count
          if (oldVote === 1) newUpvotes = Math.max(0, newUpvotes - 1);
          else if (oldVote === -1) newDownvotes = Math.max(0, newDownvotes - 1);

          // Apply new vote
          const newUserVote = oldVote === vote ? 0 : vote;
          if (newUserVote === 1) newUpvotes += 1;
          else if (newUserVote === -1) newDownvotes += 1;

          return {
            ...old,
            userVote: newUserVote,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
          };
        });

        toast({
          title: 'Gửi đánh giá thành công! 👍',
          description: 'Cảm ơn bạn đã phản hồi về bài nghe.',
        });
      }

      return { previousDetail };
    },
    onError: (err, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(listeningKeys.detail(id), context.previousDetail);
      }
      toast({
        title: 'Lỗi gửi đánh giá',
        description: 'Không thể cập nhật phản hồi của bạn. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({
        queryKey: listeningKeys.detail(id),
      });
    },
  });
}

export function useCreateListeningMaterial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: unknown) => listeningApi.createListeningMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: listeningKeys.materials(),
      });
      toast({
        title: 'Xuất bản thành công! 🎉',
        description: 'Bài nghe mới đã được đưa lên hệ thống.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Lỗi xuất bản',
        description: err.message || 'Không thể xuất bản tài liệu nghe mới.',
        variant: 'destructive',
      });
    },
  });
}

export function useToggleListeningBookmark() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => listeningApi.toggleListeningBookmark(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: listeningKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: listeningKeys.materials() });

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData<ListeningMaterial>(listeningKeys.detail(id));
      const previousLists = queryClient.getQueriesData({ queryKey: listeningKeys.materials() });

      // 1. Update details query cache
      if (previousDetail) {
        queryClient.setQueryData(listeningKeys.detail(id), (old: ListeningMaterial | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isBookmarked: !old.isBookmarked,
          };
        });

        // Optimistic toast notification
        const willBeBookmarked = !previousDetail.isBookmarked;
        toast({
          title: willBeBookmarked ? 'Đã thêm vào Bookmark! 📌' : 'Đã xóa khỏi Bookmark! 🗑️',
          description: willBeBookmarked 
            ? `Đã ghim bài học "${previousDetail.title}" vào thư viện cá nhân.`
            : `Đã xóa bài học "${previousDetail.title}" khỏi thư viện cá nhân.`,
        });
      }

      // 2. Update list and infinite query caches
      previousLists.forEach(([queryKey, oldData]) => {
        if (oldData) {
          const data = oldData as {
            pages?: { items: ListeningMaterial[] }[];
            items?: ListeningMaterial[];
          };
          if ('pages' in data && data.pages) {
            queryClient.setQueryData(queryKey, {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items?.map((item) =>
                  item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
                ),
              })),
            });
          } else if (data.items) {
            queryClient.setQueryData(queryKey, {
              ...data,
              items: data.items.map((item) =>
                item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
              ),
            });
          }
        }
      });

      return { previousDetail, previousLists };
    },
    onError: (err, id, context) => {
      // Rollback on failure
      if (context?.previousDetail) {
        queryClient.setQueryData(listeningKeys.detail(id), context.previousDetail);
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      toast({
        title: 'Thao tác thất bại',
        description: 'Không thể cập nhật trạng thái lưu trữ. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
    onSettled: (_, __, id) => {
      // Refetch and align client-server states
      queryClient.invalidateQueries({
        queryKey: listeningKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: listeningKeys.materials(),
      });
      queryClient.invalidateQueries({
        queryKey: listeningKeys.userStats(),
      });
      queryClient.invalidateQueries({
        queryKey: listeningKeys.weeklyActivity(),
      });
    },
  });
}

export function useListeningUserStats() {
  return useQuery({
    queryKey: listeningKeys.userStats(),
    queryFn: () => listeningApi.getUserStats(),
  });
}

export function useListeningWeeklyActivity() {
  return useQuery({
    queryKey: listeningKeys.weeklyActivity(),
    queryFn: () => listeningApi.getWeeklyActivity(),
  });
}

export function useListeningLeaderboard(limit?: number) {
  return useQuery({
    queryKey: listeningKeys.leaderboard(limit),
    queryFn: () => listeningApi.getListeningLeaderboard(limit),
  });
}

export * from './useListeningExplore';
export * from './useListeningHub';
export * from './useListeningLibrary';
export * from './useListeningStudyDashboard';
export * from './useListeningContribute';
export * from './useDictationWorkspace';
export * from './useGapFillWorkspace';
export * from './useQuizWorkspace';
export * from './useShadowingWorkspace';
export * from './useTranscriptWorkspace';
