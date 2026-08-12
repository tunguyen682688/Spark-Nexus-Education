import type {
  JsonApiResponse,
  JsonApiPaginatedResponse,
  ResourceObject,
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

export type ResourceListResponse<T> =
  | T[]
  | JsonApiPaginatedResponse<T>
  | {
      data: Array<ResourceObject<T>>;
    }
  | {
      data: T[];
    };

export const getAxiosInstance = async () => {
  const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
  return getAxiosClient();
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isResourceObject<T>(value: unknown): value is ResourceObject<T> {
  if (!isRecord(value)) return false;
  const candidate = value as { id?: unknown; type?: unknown; attributes?: unknown };
  return typeof candidate.id === 'string' && isRecord(candidate.attributes);
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

export function extractCollection<T>(payload: ResourceListResponse<T>): T[] {
  if (isRecord(payload) && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data.map((item) => {
        if (isResourceObject<T>(item)) {
          return {
            ...(item.attributes as T),
            ...((item.id && typeof item.id === 'string') ? { id: item.id } : {}),
          } as T;
        }
        return item as T;
      });
    }
  }
  return Array.isArray(payload) ? (payload as T[]) : [];
}
