import type {
  ApiQueryParams,
  JsonApiPaginatedResponse,
  JsonApiResponse,
  ResourceObject,
  SimplifiedPaginatedResponse,
} from '@spark-nest-ed/frontend-core-api';

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

  const searchQuery = params.search ?? params.q;
  if (searchQuery) {
    searchParams.append('search', searchQuery);
  }

  // Simple filters
  if (params.filters && !Array.isArray(params.filters)) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      searchParams.append(key, String(value));
    });
  }

  const queryString = searchParams.toString();
  return queryString.trim().length > 0 ? `?${queryString}` : '';
}

export function serializeContent(content: unknown): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  try {
    return JSON.stringify(content);
  } catch (e) {
    console.error('Failed to stringify content', e);
    return '';
  }
}
