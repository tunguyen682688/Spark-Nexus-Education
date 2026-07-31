import { useQuery } from '@tanstack/react-query';
import { CertificationApi } from '../../api/certification-api';
import { STALE_TIME_COLLECTIONS } from './use-query-constants';
import type {
  PracticeHistoryResponse,
  CompletedCollectionsResponse,
  FavoritesResponse,
  BookmarksResponse,
  DownloadsResponse,
  PurchasedCollectionsResponse,
  CertificateItem,
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

/** In-progress session item shape. */
export interface InProgressSessionItem {
  id: string;
  examId: string;
  title: string;
  status: string;
  startedAt: string;
  timeAgo: string;
  examTitle: string;
  totalQuestions: number;
  examType?: string;
  exam?: string;
}

/** Cloned collection item shape. */
export interface ClonedCollectionItem {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  publishStatus: string;
  createdAt: string;
  examCount: number;
  itemCount: number;
  examType?: string;
  exam?: string;
}

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
