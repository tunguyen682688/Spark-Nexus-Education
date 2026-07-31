import { useQuery } from '@tanstack/react-query';
import { CertificationApi } from '../../api/certification-api';
import { STALE_TIME_COLLECTIONS } from './use-query-constants';
import type { ExamCollection } from '../../types';

export const useFeaturedCollections = (exam?: string, search?: string) => {
  const safeExam = exam ?? '';
  const safeSearch = search ?? '';
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'featured', safeExam, safeSearch],
    queryFn: () => CertificationApi.getFeaturedCollections(safeExam, safeSearch),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useTrendingCollections = () => {
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'trending'],
    queryFn: () => CertificationApi.getTrendingCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useOfficialCollections = () => {
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'official'],
    queryFn: () => CertificationApi.getOfficialCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCommunityCollections = () => {
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'community'],
    queryFn: () => CertificationApi.getCommunityCollections(),
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
