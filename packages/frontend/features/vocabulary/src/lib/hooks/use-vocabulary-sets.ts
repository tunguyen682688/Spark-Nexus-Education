/**
 * Vocabulary hooks – enterprise-ready Create Vocabulary Set hook.
 *
 * Key characteristics:
 * - Query Key factory for consistent cache operations
 * - JSON:API aware mutation response handling
 * - Optimistic update with rollback safety
 * - Automatic cache invalidation for related queries
 */

import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  type MutationFunction,
  type QueryKey,
} from '@tanstack/react-query';
import type {
  ApiQueryParams,
  SimplifiedPaginatedResponse,
} from '@spark-nest-ed/frontend-core-api';

import type {
  CommunityVocabularySet,
  CreateVocabularySetDto,
  UpdateVocabularySetDto,
  AddWordToSetDto,
  SyncVocabularySetItemsDto,
  VocabularySet,
  VocabularySetItem,
  Word,
  FlashcardSessionResponse,
  UserVocabularyProgressResponse,
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
  // User's personal sets
  myCreated: () => [...vocabularyKeys.root, 'my', 'created'] as const,
  myCreatedList: (params?: ApiQueryParams) =>
    [...vocabularyKeys.myCreated(), 'list', params] as const,
  myFavorites: () => [...vocabularyKeys.root, 'my', 'favorites'] as const,
  myFavoritesList: (params?: ApiQueryParams) =>
    [...vocabularyKeys.myFavorites(), 'list', params] as const,
  // Entry/word details
  entry: (entryId: string) =>
    [...vocabularyKeys.root, 'entry', entryId] as const,
} as const;

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_PAGE_SIZE = 20;
const STALE_TIME = {
  COMMUNITY: 3 * 60 * 1000,
  DETAIL: 5 * 60 * 1000,
  WORDS: 2 * 60 * 1000,
  MY_SETS: 2 * 60 * 1000,
  MY_FAVORITES: 2 * 60 * 1000,
} as const;

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
// Hook
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
      // Also invalidate favorites list when toggling
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.myFavorites() });
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.detail(variables.setId),
      });
    },
  });
}

// =============================================================================
// USER'S PERSONAL VOCABULARY SETS HOOKS
// =============================================================================

/**
 * Fetch vocabulary sets created by the current user.
 *
 * Usage:
 * ```tsx
 * const { data, isLoading, error } = useMyCreatedSets({ page: 1, pageSize: 10 });
 * ```
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
 *
 * Usage:
 * ```tsx
 * const { data, isLoading, error } = useMyFavoriteSets({ page: 1, pageSize: 10 });
 * ```
 */
export function useMyFavoriteSets(params?: ApiQueryParams) {
  return useQuery<SimplifiedPaginatedResponse<VocabularySet>>({
    queryKey: vocabularyKeys.myFavoritesList(params),
    queryFn: () => vocabularyApi.getMyFavorites(params),
    staleTime: STALE_TIME.MY_FAVORITES,
    placeholderData: (previousData) => previousData,
  });
}

// =============================================================================
// UPDATE VOCABULARY SET HOOKS
// =============================================================================

/**
 * Update vocabulary set information.
 *
 * Usage:
 * ```tsx
 * const updateSet = useUpdateVocabularySet();
 * await updateSet.mutateAsync({ setId: '123', title: 'New Title' });
 * ```
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
      // Invalidate and refetch related queries
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
 *
 * Usage:
 * ```tsx
 * const addWord = useAddWordToSet();
 * await addWord.mutateAsync({
 *   setId: '123',
 *   payload: { word: { word: 'hello', definition: 'greeting' } }
 * });
 * ```
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
      // Invalidate words list and set detail
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
 *
 * Usage:
 * ```tsx
 * const updateWord = useUpdateWordInSet();
 * await updateWord.mutateAsync({
 *   setId: '123',
 *   wordId: '456',
 *   payload: { word: { definition: 'new definition' } }
 * });
 * ```
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
      // Invalidate words list and set detail
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
 *
 * Usage:
 * ```tsx
 * const deleteWord = useDeleteWordFromSet();
 * await deleteWord.mutateAsync({ setId: '123', wordId: '456' });
 * ```
 */
export function useDeleteWordFromSet() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { setId: string; wordId: string }>({
    mutationFn: ({ setId, wordId }) =>
      vocabularyApi.deleteWordFromSet(setId, wordId),
    onSuccess: (data, variables) => {
      // Invalidate words list and set detail
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
 *
 * Usage:
 * ```tsx
 * const deleteSet = useDeleteVocabularySet();
 * await deleteSet.mutateAsync('set-id-123');
 * ```
 */
export function useDeleteVocabularySet() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (setId) => vocabularyApi.deleteVocabularySet(setId),
    onSuccess: () => {
      // Invalidate all vocabulary set lists
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

// =============================================================================
// Entry/Word Detail Hook
// =============================================================================

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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// =============================================================================
// Flashcard Hooks
// =============================================================================

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
    staleTime: 0, // Always load fresh details for study session
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
