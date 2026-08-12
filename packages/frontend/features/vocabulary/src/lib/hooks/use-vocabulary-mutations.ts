/**
 * Vocabulary mutation hooks – React Query hooks for creating, updating, deleting vocabulary data.
 */

import { useMutation, useQueryClient, type MutationFunction, type QueryKey } from '@tanstack/react-query';
import type { SimplifiedPaginatedResponse } from '@spark-nest-ed/frontend-core-api';

import type {
  CommunityVocabularySet,
  CreateVocabularySetDto,
  UpdateVocabularySetDto,
  AddWordToSetDto,
  SyncVocabularySetItemsDto,
  VocabularySet,
  VocabularySetItem,
  UserVocabularyProgressResponse,
} from '../types';
import { vocabularyApi } from '../api/vocabulary-api';
import { vocabularyKeys } from './use-vocabulary-queries';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_PAGE_SIZE = 20;

// =============================================================================
// Types
// =============================================================================

interface CreateSetContext {
  previous?: SimplifiedPaginatedResponse<VocabularySet>;
  queryKey: QueryKey;
}

interface ToggleFavoriteVariables {
  setId: string;
  isFavorited: boolean;
}

interface ToggleFavoriteContext {
  snapshots: Array<{
    key: QueryKey;
    data?: SimplifiedPaginatedResponse<CommunityVocabularySet>;
  }>;
  previousDetail?: VocabularySet;
}

// =============================================================================
// Helpers
// =============================================================================

function buildOptimisticSet(variables: CreateVocabularySetDto): VocabularySet {
  const now = new Date().toISOString();
  return {
    id: `temp-${Date.now()}`,
    title: variables.title,
    description: variables.description ?? null,
    language: variables.language,
    type: variables.type,
    difficulty: variables.difficulty ?? null,
    tags: variables.tags ?? [],
    coverImage: null,
    entryCount:
      variables.initialWords?.length || variables.initialEntryIds?.length || 0,
    favoriteCount: 0,
    studyCount: 0,
    userId: '',
    isPublic: false,
    isActive: true,
    importStatus: 'idle',
    importProgress: null,
    createdAt: now,
    updatedAt: now,
  };
}

function updateFavoriteSnapshot(
  data: SimplifiedPaginatedResponse<CommunityVocabularySet> | undefined,
  setId: string,
  isFavorited: boolean
): SimplifiedPaginatedResponse<CommunityVocabularySet> | undefined {
  if (!data) return data;
  return {
    ...data,
    data: data.data.map((set) =>
      set.id === setId
        ? {
            ...set,
            isFavorited,
            favoriteCount: Math.max(
              0,
              set.favoriteCount + (isFavorited ? 1 : -1)
            ),
          }
        : set
    ),
  };
}

function addSetToCache(
  current: SimplifiedPaginatedResponse<VocabularySet> | undefined,
  newSet: VocabularySet
): SimplifiedPaginatedResponse<VocabularySet> {
  if (!current) {
    return {
      data: [newSet],
      meta: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 1, totalPages: 1 },
    };
  }

  return {
    ...current,
    data: [newSet, ...current.data],
    meta: {
      ...current.meta,
      total: current.meta.total + 1,
      totalPages: Math.ceil((current.meta.total + 1) / current.meta.limit),
    },
  };
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * useCreateVocabularySet
 *
 * Usage:
 * ```tsx
 * const createSet = useCreateVocabularySet();
 * createSet.mutate({ title: 'English Basics', language: 'en', type: 'flashcard' });
 * ```
 */
export function useCreateVocabularySet() {
  const queryClient = useQueryClient();
  const listKey = vocabularyKeys.list();

  const mutationFn: MutationFunction<VocabularySet, CreateVocabularySetDto> = (
    payload
  ) => vocabularyApi.createSet(payload);

  return useMutation<
    VocabularySet,
    Error,
    CreateVocabularySetDto,
    CreateSetContext
  >({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: listKey });

      const previous =
        queryClient.getQueryData<SimplifiedPaginatedResponse<VocabularySet>>(
          listKey
        );

      const optimisticSet = buildOptimisticSet(variables);
      queryClient.setQueryData(listKey, addSetToCache(previous, optimisticSet));

      return { previous, queryKey: listKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.sets() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}

/**
 * Toggle favorite state for community sets.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    ToggleFavoriteVariables,
    ToggleFavoriteContext
  >({
    mutationFn: ({ setId, isFavorited }) =>
      vocabularyApi.toggleCommunityFavorite(setId, isFavorited),
    onMutate: async (variables) => {
      const snapshots = queryClient
        .getQueriesData<SimplifiedPaginatedResponse<CommunityVocabularySet>>({
          queryKey: vocabularyKeys.community(),
        })
        .map(([key, data]) => ({ key, data }));

      snapshots.forEach(({ key, data }) => {
        queryClient.setQueryData(
          key,
          updateFavoriteSnapshot(data, variables.setId, variables.isFavorited)
        );
      });

      const detailKey = vocabularyKeys.detail(variables.setId);
      const previousDetail = queryClient.getQueryData<VocabularySet>(detailKey);
      if (previousDetail) {
        queryClient.setQueryData<any>(detailKey, {
          ...previousDetail,
          isFavorited: variables.isFavorited,
          favoriteCount: Math.max(
            0,
            previousDetail.favoriteCount + (variables.isFavorited ? 1 : -1)
          ),
        });
      }

      return { snapshots, previousDetail };
    },
    onError: (_error, variables, context) => {
      context?.snapshots.forEach(({ key, data }) => {
        queryClient.setQueryData(key, data);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(
          vocabularyKeys.detail(variables.setId),
          context.previousDetail
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.community() });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.myFavorites() });
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.detail(variables.setId),
      });
    },
  });
}

/**
 * Update vocabulary set information.
 */
export function useUpdateVocabularySet() {
  const queryClient = useQueryClient();

  return useMutation<
    VocabularySet,
    Error,
    { setId: string; payload: UpdateVocabularySetDto }
  >({
    mutationFn: ({ setId, payload }) => vocabularyApi.updateSet(setId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.detail(variables.setId),
      });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.myCreated() });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.list() });
    },
  });
}

/**
 * Add a word to vocabulary set.
 */
export function useAddWordToSet() {
  const queryClient = useQueryClient();

  return useMutation<
    VocabularySetItem,
    Error,
    { setId: string; payload: AddWordToSetDto }
  >({
    mutationFn: ({ setId, payload }) =>
      vocabularyApi.addWordToSet(setId, payload),
    onSuccess: (data, variables) => {
      const wordsKey = [...vocabularyKeys.detail(variables.setId), 'words'];
      queryClient.invalidateQueries({ queryKey: wordsKey });
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.detail(variables.setId),
      });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.myCreated() });
    },
  });
}

/**
 * Update a word in vocabulary set.
 */
export function useUpdateWordInSet() {
  const queryClient = useQueryClient();

  return useMutation<
    VocabularySetItem,
    Error,
    { setId: string; wordId: string; payload: Partial<AddWordToSetDto> }
  >({
    mutationFn: ({ setId, wordId, payload }) =>
      vocabularyApi.updateWordInSet(setId, wordId, payload),
    onSuccess: (data, variables) => {
      const wordsKey = [...vocabularyKeys.detail(variables.setId), 'words'];
      queryClient.invalidateQueries({ queryKey: wordsKey });
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.detail(variables.setId),
      });
    },
  });
}

/**
 * Delete a word from vocabulary set.
 */
export function useDeleteWordFromSet() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { setId: string; wordId: string }>({
    mutationFn: ({ setId, wordId }) =>
      vocabularyApi.deleteWordFromSet(setId, wordId),
    onSuccess: (data, variables) => {
      const wordsKey = [...vocabularyKeys.detail(variables.setId), 'words'];
      queryClient.invalidateQueries({ queryKey: wordsKey });
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.detail(variables.setId),
      });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.myCreated() });
    },
  });
}

/**
 * Delete a vocabulary set.
 */
export function useDeleteVocabularySet() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (setId) => vocabularyApi.deleteVocabularySet(setId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.sets() });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.myCreated() });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.myFavorites() });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.community() });
    },
  });
}

/**
 * Sync vocabulary set items.
 */
export function useSyncVocabularySetItems() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      setId: string;
      payload: SyncVocabularySetItemsDto;
      config?: Record<string, unknown>;
    }
  >({
    mutationFn: ({ setId, payload, config }) =>
      vocabularyApi.syncSetItems(setId, payload, config),
    onSuccess: (_data, { setId }) => {
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.detail(setId) });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.words(setId) });
    },
  });
}

/**
 * Record a flashcard review (SRS SM-2 update).
 *
 * NOTE: Cache invalidation is intentionally NOT done here.
 * The container (`FlashcardPracticeContainer`) handles invalidation
 * once the full session is complete to avoid disruptive mid-session refetches.
 * The mutation returns the real server-side SRS progress so the container
 * can sync it back into local session state immediately.
 */
export function useReviewFlashcard(_setId: string) {
  return useMutation<
    UserVocabularyProgressResponse,
    Error,
    { itemId: string; quality: number }
  >({
    mutationFn: ({ itemId, quality }) =>
      vocabularyApi.reviewFlashcard(_setId, itemId, quality),
  });
}
