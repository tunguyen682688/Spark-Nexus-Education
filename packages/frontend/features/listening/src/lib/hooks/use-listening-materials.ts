import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { listeningApi } from '../api/listening-api';
import { listeningKeys } from './listening-keys';

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
