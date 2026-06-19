import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listeningApi } from '../api/listening-api';

export function useListeningMaterials(params?: {
  category?: string;
  difficulty?: string;
  isCommunity?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['listening-materials', params],
    queryFn: () => listeningApi.getListeningMaterials(params),
  });
}

export function useListeningMaterialDetail(id: string) {
  return useQuery({
    queryKey: ['listening-material-detail', id],
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
      queryClient.invalidateQueries({
        queryKey: ['listening-material-detail', variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['listening-materials'],
      });
    },
  });
}

export function useVoteListeningMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, vote }: { id: string; vote: number }) =>
      listeningApi.voteListeningMaterial(id, vote),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['listening-material-detail', variables.id],
      });
    },
  });
}
