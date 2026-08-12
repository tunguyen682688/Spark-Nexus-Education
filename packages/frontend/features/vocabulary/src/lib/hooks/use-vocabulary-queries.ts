/**
 * Vocabulary query hooks – React Query hooks for fetching vocabulary data.
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type {
  ApiQueryParams,
  SimplifiedPaginatedResponse,
} from '@spark-nest-ed/frontend-core-api';

import type {
  CommunityVocabularySet,
  VocabularySet,
  VocabularySetItem,
  Word,
  FlashcardSessionResponse,
} from '../types';
import { vocabularyApi } from '../api/vocabulary-api';

// =============================================================================
// Query Key Factory
// =============================================================================

export const vocabularyKeys = {
  root: ['vocabulary'] as const,
  sets: () => [...vocabularyKeys.root, 'sets'] as const,
  list: () => [...vocabularyKeys.sets(), 'list'] as const,
  detail: (setId: string) =>
    [...vocabularyKeys.sets(), 'detail', setId] as const,
  words: (setId: string, params?: ApiQueryParams) =>
    [...vocabularyKeys.detail(setId), 'words', params] as const,
  community: () => [...vocabularyKeys.root, 'community'] as const,
  communityList: (params?: ApiQueryParams) =>
    [...vocabularyKeys.community(), 'list', params] as const,
  myCreated: () => [...vocabularyKeys.root, 'my', 'created'] as const,
  myCreatedList: (params?: ApiQueryParams) =>
    [...vocabularyKeys.myCreated(), 'list', params] as const,
  myFavorites: () => [...vocabularyKeys.root, 'my', 'favorites'] as const,
  myFavoritesList: (params?: ApiQueryParams) =>
    [...vocabularyKeys.myFavorites(), 'list', params] as const,
  entry: (entryId: string) =>
    [...vocabularyKeys.root, 'entry', entryId] as const,
} as const;

// =============================================================================
// Constants
// =============================================================================

const STALE_TIME = {
  COMMUNITY: 3 * 60 * 1000,
  DETAIL: 5 * 60 * 1000,
  WORDS: 2 * 60 * 1000,
  MY_SETS: 2 * 60 * 1000,
  MY_FAVORITES: 2 * 60 * 1000,
} as const;

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch a single vocabulary set detail.
 */
export function useVocabularySet(setId: string | null | undefined) {
  return useQuery<VocabularySet>({
    queryKey: vocabularyKeys.detail(setId ?? 'unknown'),
    queryFn: () => vocabularyApi.getVocabularySet(setId as string),
    enabled: Boolean(setId),
    staleTime: STALE_TIME.DETAIL,
  });
}

/**
 * Fetch words that belong to a vocabulary set.
 */
export function useSetWords(
  setId: string | null | undefined,
  params?: ApiQueryParams
) {
  return useQuery<SimplifiedPaginatedResponse<VocabularySetItem>>({
    queryKey: vocabularyKeys.words(setId ?? 'unknown', params),
    queryFn: () => vocabularyApi.getSetWords(setId as string, params),
    enabled: Boolean(setId),
    staleTime: STALE_TIME.WORDS,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch words that belong to a vocabulary set with infinite scrolling.
 */
export function useInfiniteSetWords(
  setId: string | null | undefined,
  params?: ApiQueryParams
) {
  return useInfiniteQuery<SimplifiedPaginatedResponse<VocabularySetItem>>({
    queryKey: [
      ...vocabularyKeys.detail(setId ?? 'unknown'),
      'words',
      'infinite',
      params,
    ],
    queryFn: ({ pageParam = 1 }) =>
      vocabularyApi.getSetWords(setId as string, {
        ...params,
        page: pageParam as number,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: Boolean(setId),
    staleTime: STALE_TIME.WORDS,
  });
}

/**
 * Fetch community vocabulary sets.
 */
export function useCommunityVocabularySets(params?: ApiQueryParams) {
  return useQuery<SimplifiedPaginatedResponse<CommunityVocabularySet>>({
    queryKey: vocabularyKeys.communityList(params),
    queryFn: () => vocabularyApi.getCommunitySets(params),
    staleTime: STALE_TIME.COMMUNITY,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch vocabulary sets created by the current user.
 */
export function useMyCreatedSets(params?: ApiQueryParams) {
  return useQuery<SimplifiedPaginatedResponse<VocabularySet>>({
    queryKey: vocabularyKeys.myCreatedList(params),
    queryFn: () => vocabularyApi.getMyCreatedSets(params),
    staleTime: STALE_TIME.MY_SETS,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch vocabulary sets favorited by the current user from community.
 */
export function useMyFavoriteSets(params?: ApiQueryParams) {
  return useQuery<SimplifiedPaginatedResponse<VocabularySet>>({
    queryKey: vocabularyKeys.myFavoritesList(params),
    queryFn: () => vocabularyApi.getMyFavorites(params),
    staleTime: STALE_TIME.MY_FAVORITES,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Get word/entry details by entry ID
 */
export function useEntryDetail(entryId: string | null | undefined) {
  return useQuery<Word, Error>({
    queryKey: vocabularyKeys.entry(entryId ?? ''),
    queryFn: async () => {
      if (!entryId) {
        throw new Error('entryId is required');
      }
      return vocabularyApi.getEntryDetail(entryId);
    },
    enabled: !!entryId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch flashcard session (words + study progress)
 */
export function useFlashcardSession(
  setId: string | null | undefined,
  reviewAll?: boolean
) {
  return useQuery<FlashcardSessionResponse>({
    queryKey: [
      ...vocabularyKeys.detail(setId ?? 'unknown'),
      'flashcards',
      'session',
      { reviewAll },
    ] as const,
    queryFn: () =>
      vocabularyApi.getFlashcardSession(setId as string, reviewAll),
    enabled: Boolean(setId),
    staleTime: 0,
  });
}
