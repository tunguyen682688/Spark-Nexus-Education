import { useQuery } from '@tanstack/react-query';
import { CertificationApi } from '../../api/certification-api';
import { STALE_TIME_COLLECTIONS } from '../../constants/query-cache-times.constants';
import type { ExamCollection } from '../../types';

export const useFeaturedCollections = (
  exam?: string,
  search?: string,
  page?: number,
  limit?: number
) => {
  const safeExam = exam ?? '';
  const safeSearch = search ?? '';
  return useQuery({
    queryKey: ['certification', 'featured', safeExam, safeSearch, page, limit],
    queryFn: () => CertificationApi.getFeaturedCollections(safeExam, safeSearch, page, limit),
    select: (r) => r.data,
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useTrendingCollections = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['certification', 'trending', page, limit],
    queryFn: () => CertificationApi.getTrendingCollections(page, limit),
    select: (r) => r.data,
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useOfficialCollections = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['certification', 'official', page, limit],
    queryFn: () => CertificationApi.getOfficialCollections(page, limit),
    select: (r) => r.data,
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCommunityCollections = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['certification', 'community', page, limit],
    queryFn: () => CertificationApi.getCommunityCollections(page, limit),
    select: (r) => r.data,
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCollectionDetail = (id: string) => {
  return useQuery<ExamCollection | null>({
    queryKey: ['certification', 'collection', id],
    queryFn: () => CertificationApi.getCollection(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCollectionItems = (collectionId: string) => {
  return useQuery({
    queryKey: ['certification', 'collection-items', collectionId],
    queryFn: () => CertificationApi.getCollectionItems(collectionId),
    enabled: Boolean(collectionId),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useSavedCollections = () => {
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'saved-collections'],
    queryFn: () => CertificationApi.getSavedCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useMyCollections = () => {
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'my-collections'],
    queryFn: () => CertificationApi.getMyCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};
