import { useQuery } from '@tanstack/react-query';
import { CertificationApi } from '../../api/certification-api';
import { STALE_TIME_COLLECTIONS } from '../../constants/query-cache-times.constants';
import type {
  PracticeHistoryResponse,
  CompletedCollectionsResponse,
  FavoritesResponse,
  BookmarksResponse,
  DownloadsResponse,
  PurchasedCollectionsResponse,
  CertificateItem,
  InProgressSessionItem,
  ClonedCollectionItem,
} from '../../types';

export const usePracticeHistoryData = () => {
  return useQuery<PracticeHistoryResponse>({
    queryKey: ['certification', 'history'],
    queryFn: () => CertificationApi.getPracticeHistory(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCompletedCollectionsData = () => {
  return useQuery<CompletedCollectionsResponse>({
    queryKey: ['certification', 'completed'],
    queryFn: () => CertificationApi.getCompletedCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useFavoritesData = () => {
  return useQuery<FavoritesResponse>({
    queryKey: ['certification', 'favorites'],
    queryFn: () => CertificationApi.getFavorites(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useBookmarksData = () => {
  return useQuery<BookmarksResponse>({
    queryKey: ['certification', 'bookmarks'],
    queryFn: () => CertificationApi.getBookmarks(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useInProgressSessions = () => {
  return useQuery<{ id: string; userId: string; totalInProgress: number; items: InProgressSessionItem[] }>({
    queryKey: ['certification', 'in-progress'],
    queryFn: () => CertificationApi.getInProgressSessions(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useClonedCollections = () => {
  return useQuery<{ id: string; userId: string; totalCloned: number; items: ClonedCollectionItem[] }>({
    queryKey: ['certification', 'cloned'],
    queryFn: () => CertificationApi.getClonedCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useDownloadsData = () => {
  return useQuery<DownloadsResponse>({
    queryKey: ['certification', 'downloads'],
    queryFn: () => CertificationApi.getDownloads(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const usePurchasedCollectionsData = () => {
  return useQuery<PurchasedCollectionsResponse>({
    queryKey: ['certification', 'purchased'],
    queryFn: () => CertificationApi.getPurchasedCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useUserCertificates = () => {
  return useQuery<CertificateItem[]>({
    queryKey: ['certification', 'user-certificates'],
    queryFn: () => CertificationApi.getCertificates(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};
