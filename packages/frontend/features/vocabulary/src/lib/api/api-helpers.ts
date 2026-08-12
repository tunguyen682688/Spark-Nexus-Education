import type {
  ApiQueryParams,
  JsonApiPaginatedResponse,
  JsonApiResponse,
  ResourceObject,
  SimplifiedPaginatedResponse,
} from '@spark-nest-ed/frontend-core-api';

export const ENDPOINTS = {
  sets: '/vocabulary/packages',
  set: (id: string) => `/vocabulary/packages/${id}`,
  setWords: (id: string) => `/vocabulary/packages/${id}/words`,
  setItems: (id: string) => `/vocabulary/packages/${id}/items`,
  setWord: (setId: string, wordId: string) => `/vocabulary/packages/${setId}/words/${wordId}`,
  communitySet: (id: string) => `/vocabulary/packages/community/${id}`,
  communitySets: '/vocabulary/packages/community',
  communityFavorite: (id: string) => `/vocabulary/packages/community/${id}/favorite`,
  myCreatedSets: '/vocabulary/packages/my/created',
  myFavorites: '/vocabulary/packages/my/favorites',
  entry: (entryId: string) => `/vocabulary/entries/${entryId}`,
  flashcardSession: (id: string) => `/vocabulary/packages/${id}/flashcards/session`,
  flashcardReview: (id: string) => `/vocabulary/packages/${id}/flashcards/review`,
} as const;

export type ResourceResponse<T> =
  | T
  | JsonApiResponse<T>
  | {
      data: ResourceObject<T>;
    }
  | {
      data: T;
    };

export type JsonApiListResponse<T> = JsonApiPaginatedResponse<T>;

export const getAxiosInstance = async () => {
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

export function extractResource<T>(payload: ResourceResponse<T>): T {
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

export function extractPaginatedResponse<T>(
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

export function buildQueryString(params?: ApiQueryParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.append('page', String(params.page));
  if (params.pageSize !== undefined) {
    searchParams.append('pageSize', String(params.pageSize));
  } else if (params.limit !== undefined) {
    searchParams.append('limit', String(params.limit));
  }
  if (params.offset !== undefined) searchParams.append('offset', String(params.offset));

  if (params.sortBy) {
    searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) {
      searchParams.append('sortDirection', params.sortOrder);
    }
  }

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

  const searchQuery = params.search ?? params.q;
  if (searchQuery) {
    searchParams.append('search', searchQuery);
    params.searchFields?.forEach((field, index) => {
      searchParams.append(`searchFields[${index}]`, field);
    });
  }

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
