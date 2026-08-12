import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listeningApi } from '../api/listening-api';
import { ListeningMaterial } from '../types';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { listeningKeys } from './listening-keys';

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

      if (variables.completed) {
        queryClient.invalidateQueries({ queryKey: listeningKeys.materials() });
        queryClient.invalidateQueries({ queryKey: listeningKeys.userStats() });
        queryClient.invalidateQueries({ queryKey: listeningKeys.weeklyActivity() });
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
      await queryClient.cancelQueries({ queryKey: listeningKeys.detail(id) });
      const previousDetail = queryClient.getQueryData<ListeningMaterial>(listeningKeys.detail(id));

      if (previousDetail) {
        queryClient.setQueryData(listeningKeys.detail(id), (old: ListeningMaterial | undefined) => {
          if (!old) return old;
          const oldVote = old.userVote || 0;
          let newUpvotes = old.upvotes || 0;
          let newDownvotes = old.downvotes || 0;
          if (oldVote === 1) newUpvotes = Math.max(0, newUpvotes - 1);
          else if (oldVote === -1) newDownvotes = Math.max(0, newDownvotes - 1);
          const newUserVote = oldVote === vote ? 0 : vote;
          if (newUserVote === 1) newUpvotes += 1;
          else if (newUserVote === -1) newDownvotes += 1;
          return { ...old, userVote: newUserVote, upvotes: newUpvotes, downvotes: newDownvotes };
        });
        toast({ title: 'Gửi đánh giá thành công! 👍', description: 'Cảm ơn bạn đã phản hồi về bài nghe.' });
      }
      return { previousDetail };
    },
    onError: (err, { id }, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(listeningKeys.detail(id), context.previousDetail);
      }
      toast({ title: 'Lỗi gửi đánh giá', description: 'Không thể cập nhật phản hồi của bạn. Vui lòng thử lại.', variant: 'destructive' });
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: listeningKeys.detail(id) });
    },
  });
}

export function useCreateListeningMaterial() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: unknown) => listeningApi.createListeningMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listeningKeys.materials() });
      toast({ title: 'Xuất bản thành công! 🎉', description: 'Bài nghe mới đã được đưa lên hệ thống.' });
    },
    onError: (err) => {
      toast({ title: 'Lỗi xuất bản', description: err.message || 'Không thể xuất bản tài liệu nghe mới.', variant: 'destructive' });
    },
  });
}

export function useToggleListeningBookmark() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => listeningApi.toggleListeningBookmark(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listeningKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: listeningKeys.materials() });
      const previousDetail = queryClient.getQueryData<ListeningMaterial>(listeningKeys.detail(id));
      const previousLists = queryClient.getQueriesData({ queryKey: listeningKeys.materials() });

      if (previousDetail) {
        queryClient.setQueryData(listeningKeys.detail(id), (old: ListeningMaterial | undefined) => {
          if (!old) return old;
          return { ...old, isBookmarked: !old.isBookmarked };
        });
        const willBeBookmarked = !previousDetail.isBookmarked;
        toast({
          title: willBeBookmarked ? 'Đã thêm vào Bookmark! 📌' : 'Đã xóa khỏi Bookmark! 🗑️',
          description: willBeBookmarked
            ? `Đã ghim bài học "${previousDetail.title}" vào thư viện cá nhân.`
            : `Đã xóa bài học "${previousDetail.title}" khỏi thư viện cá nhân.`,
        });
      }

      previousLists.forEach(([queryKey, oldData]) => {
        if (oldData) {
          const data = oldData as { pages?: { items: ListeningMaterial[] }[]; items?: ListeningMaterial[] };
          if ('pages' in data && data.pages) {
            queryClient.setQueryData(queryKey, {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items?.map((item) => item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item),
              })),
            });
          } else if (data.items) {
            queryClient.setQueryData(queryKey, {
              ...data,
              items: data.items.map((item) => item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item),
            });
          }
        }
      });
      return { previousDetail, previousLists };
    },
    onError: (err, id, context) => {
      if (context?.previousDetail) queryClient.setQueryData(listeningKeys.detail(id), context.previousDetail);
      if (context?.previousLists) context.previousLists.forEach(([queryKey, oldData]) => queryClient.setQueryData(queryKey, oldData));
      toast({ title: 'Thao tác thất bại', description: 'Không thể cập nhật trạng thái lưu trữ. Vui lòng thử lại.', variant: 'destructive' });
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: listeningKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listeningKeys.materials() });
      queryClient.invalidateQueries({ queryKey: listeningKeys.userStats() });
      queryClient.invalidateQueries({ queryKey: listeningKeys.weeklyActivity() });
    },
  });
}
