/**
 * Vocabulary API – Axios abstraction layer.
 * Provides JSON:API aware helpers that can be reused by React Query hooks.
 */

import type {
  ApiQueryParams,
  JsonApiPaginatedResponse,
  JsonApiResponse,
  ResourceObject,
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

const ENDPOINTS = {
  sets: '/vocabulary/packages',
  set: (id: string) => `/vocabulary/packages/${id}`,
  setWords: (id: string) => `/vocabulary/packages/${id}/words`,
  setItems: (id: string) => `/vocabulary/packages/${id}/items`,
  setWord: (setId: string, wordId: string) => `/vocabulary/packages/${setId}/words/${wordId}`,
  communitySet: (id: string) => `/vocabulary/packages/community/${id}`,
  communitySets: '/vocabulary/packages/community',
  communityFavorite: (id: string) => `/vocabulary/packages/community/${id}/favorite`,
  // User's personal sets
  myCreatedSets: '/vocabulary/packages/my/created',
  myFavorites: '/vocabulary/packages/my/favorites',
  // Entry/word details
  entry: (entryId: string) => `/vocabulary/entries/${entryId}`,
  flashcardSession: (id: string) => `/vocabulary/packages/${id}/flashcards/session`,
  flashcardReview: (id: string) => `/vocabulary/packages/${id}/flashcards/review`,
} as const;

type ResourceResponse<T> =
  | T
  | JsonApiResponse<T>
  | {
      data: ResourceObject<T>;
    }
  | {
      data: T;
    };

type CreateSetResponse = ResourceResponse<VocabularySet>;

type JsonApiListResponse<T> = JsonApiPaginatedResponse<T>;

const getAxiosInstance = async () => {
  const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
  return getAxiosClient();
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isResourceObject<T>(value: unknown): value is ResourceObject<T> {
  if (!isRecord(value)) {
    return false;
  }

  const candidate = value as {
    id?: unknown;
    type?: unknown;
    attributes?: unknown;
  };

  return (
    typeof candidate.id === 'string' &&
    isRecord(candidate.attributes)
  );
}

function extractResource<T>(payload: ResourceResponse<T>): T {
  if (isRecord(payload) && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (isResourceObject<T>(data)) {
      return {
        ...(data.attributes as T),
        ...(('id' in data && typeof data.id === 'string') ? ({ id: data.id } as Record<string, unknown>) : {}),
      } as T;
    }
    return data as T;
  }

  return payload as T;
}

function extractPaginatedResponse<T>(
  response: JsonApiListResponse<T>
): SimplifiedPaginatedResponse<T> {
  const meta =
    response.meta?.pagination ?? ({
      page: 1,
      limit: response.data.length,
      total: response.data.length,
      totalPages: 1,
    } as SimplifiedPaginatedResponse<T>['meta']);

  return {
    data: response.data.map((item) => ({
      ...item.attributes,
      // Include id from JSON:API resource object
      ...(item.id ? { id: item.id } : {}),
    })),
    meta: {
      ...meta,
      hasNext: response.links?.next != null,
      hasPrev: response.links?.prev != null,
    },
    links: response.links,
  };
}

function buildQueryString(params?: ApiQueryParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  // Basic pagination
  if (params.page !== undefined) searchParams.append('page', String(params.page));
  if (params.pageSize !== undefined) {
    searchParams.append('pageSize', String(params.pageSize));
  } else if (params.limit !== undefined) {
    searchParams.append('limit', String(params.limit));
  }
  if (params.offset !== undefined) searchParams.append('offset', String(params.offset));

  // Simple sort
  if (params.sortBy) {
    searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) {
      searchParams.append('sortDirection', params.sortOrder);
    }
  }

  // Advanced sort
  if (Array.isArray(params.sort)) {
    params.sort.forEach((spec, index) => {
      if (!spec || !spec.field) return;
      searchParams.append(`sort[${index}][field]`, spec.field);
      if (spec.direction) {
        searchParams.append(`sort[${index}][direction]`, spec.direction);
      }
      if (spec.priority !== undefined) {
        searchParams.append(`sort[${index}][priority]`, String(spec.priority));
      }
    });
  }

  // Search
  const searchQuery = params.search ?? params.q;
  if (searchQuery) {
    searchParams.append('search', searchQuery);
    params.searchFields?.forEach((field, index) => {
      searchParams.append(`searchFields[${index}]`, field);
    });
  }

  // Simple filters (key-value pairs)
  if (params.filters && !Array.isArray(params.filters)) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v, idx) =>
          searchParams.append(`${key}[${idx}]`, String(v))
        );
      } else {
        searchParams.append(key, String(value));
      }
    });
  }

  // Advanced filters (FilterCondition[])
  const filterConditions = Array.isArray(params.filterConditions)
    ? params.filterConditions
    : Array.isArray(params.filters)
    ? params.filters
    : undefined;

  if (filterConditions) {
    filterConditions.forEach((condition, index) => {
      if (!condition.field || !condition.operator) return;
      searchParams.append(`filters[${index}][field]`, condition.field);
      searchParams.append(`filters[${index}][operator]`, condition.operator);
      if (condition.value !== undefined) {
        searchParams.append(`filters[${index}][value]`, String(condition.value));
      }
      if (condition.value2 !== undefined) {
        searchParams.append(`filters[${index}][value2]`, String(condition.value2));
      }
    });
  }

  const queryString = searchParams.toString();
  return queryString.trim().length > 0 ? `?${queryString}` : '';
}

export const vocabularyApi = {
  async createSet(payload: CreateVocabularySetDto): Promise<VocabularySet> {
    const axios = await getAxiosInstance();
    const response = await axios.post<CreateSetResponse>(ENDPOINTS.sets, payload);
    return extractResource(response.data);
  },
  async getVocabularySet(setId: string): Promise<VocabularySet> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<VocabularySet>>(ENDPOINTS.set(setId));
    return extractResource(response.data);
  },
  async getCommunitySets(
    params?: ApiQueryParams
  ): Promise<SimplifiedPaginatedResponse<CommunityVocabularySet>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<CommunityVocabularySet>>(
      `${ENDPOINTS.communitySets}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },
  async getCommunitySet(setId: string): Promise<CommunityVocabularySet> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<CommunityVocabularySet>>(ENDPOINTS.communitySet(setId));
    return extractResource(response.data);
  },
  async getSetWords(
    setId: string,
    params?: ApiQueryParams
  ): Promise<SimplifiedPaginatedResponse<VocabularySetItem>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<VocabularySetItem>>(
      `${ENDPOINTS.setWords(setId)}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },
  async toggleCommunityFavorite(setId: string, shouldFavorite: boolean): Promise<void> {
    const axios = await getAxiosInstance();
    const endpoint = ENDPOINTS.communityFavorite(setId);
    if (shouldFavorite) {
      await axios.post(endpoint);
    } else {
      await axios.delete(endpoint);
    }
  },

  /**
   * Get word/entry details by entry ID
   */
  async getEntryDetail(entryId: string): Promise<Word> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<Word>>(ENDPOINTS.entry(entryId));
    return extractResource(response.data);
  },

  // ==================== USER'S PERSONAL VOCABULARY SETS ====================

  /**
   * Get vocabulary sets created by the current user
   */
  async getMyCreatedSets(
    params?: ApiQueryParams
  ): Promise<SimplifiedPaginatedResponse<VocabularySet>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<VocabularySet>>(
      `${ENDPOINTS.myCreatedSets}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },

  /**
   * Get vocabulary sets favorited by the current user from community
   */
  async getMyFavorites(
    params?: ApiQueryParams
  ): Promise<SimplifiedPaginatedResponse<VocabularySet>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<VocabularySet>>(
      `${ENDPOINTS.myFavorites}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },

  // ==================== UPDATE VOCABULARY SET ====================

  /**
   * Update vocabulary set information
   */
  async updateSet(
    setId: string,
    payload: UpdateVocabularySetDto
  ): Promise<VocabularySet> {
    const axios = await getAxiosInstance();
    const response = await axios.put<ResourceResponse<VocabularySet>>(
      ENDPOINTS.set(setId),
      payload
    );
    return extractResource(response.data);
  },

  /**
   * Sync vocabulary set items (Bulk Add/Update/Delete)
   */
  async syncSetItems(
    setId: string,
    payload: SyncVocabularySetItemsDto,
    config?: Record<string, unknown>
  ): Promise<void> {
    const axios = await getAxiosInstance();
    await axios.put(ENDPOINTS.setItems(setId), payload, config);
  },

  /**
   * Add a word to vocabulary set
   */
  async addWordToSet(
    setId: string,
    payload: AddWordToSetDto
  ): Promise<VocabularySetItem> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<VocabularySetItem>>(
      ENDPOINTS.setWords(setId),
      payload
    );
    return extractResource(response.data);
  },

  /**
   * Update a word in vocabulary set
   */
  async updateWordInSet(
    setId: string,
    wordId: string,
    payload: Partial<AddWordToSetDto>
  ): Promise<VocabularySetItem> {
    const axios = await getAxiosInstance();
    const response = await axios.put<ResourceResponse<VocabularySetItem>>(
      ENDPOINTS.setWord(setId, wordId),
      payload
    );
    return extractResource(response.data);
  },

  /**
   * Delete a word from vocabulary set
   */
  async deleteWordFromSet(setId: string, wordId: string): Promise<void> {
    const axios = await getAxiosInstance();
    await axios.delete(ENDPOINTS.setWord(setId, wordId));
  },

  /**
   * Delete a vocabulary set
   */
  async deleteVocabularySet(setId: string): Promise<void> {
    const axios = await getAxiosInstance();
    await axios.delete(ENDPOINTS.set(setId));
  },

  /**
   * Get a flashcard session data (words + progress)
   */
  async getFlashcardSession(setId: string, reviewAll?: boolean): Promise<FlashcardSessionResponse> {
    const axios = await getAxiosInstance();
    const url = reviewAll ? `${ENDPOINTS.flashcardSession(setId)}?reviewAll=true` : ENDPOINTS.flashcardSession(setId);
    const response = await axios.get<ResourceResponse<FlashcardSessionResponse>>(url);
    return extractResource(response.data);
  },

  /**
   * Record a flashcard review rating (SRS algorithm)
   */
  async reviewFlashcard(
    setId: string,
    itemId: string,
    quality: number
  ): Promise<UserVocabularyProgressResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<UserVocabularyProgressResponse>>(
      ENDPOINTS.flashcardReview(setId),
      { itemId, quality }
    );
    return extractResource(response.data);
  },
};
