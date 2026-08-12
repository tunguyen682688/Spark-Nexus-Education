import type { SimplifiedPaginatedResponse, PaginationMeta } from '@spark-nest-ed/frontend-core-api';

export const getAxiosInstance = async () => {
  const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
  return getAxiosClient();
};

export function unwrapJsonApiResponse<T>(payload: Record<string, unknown> | null | undefined): T {
  if (!payload) return payload as unknown as T;

  const jsonData = payload.json as Record<string, unknown> | undefined;
  if (jsonData) {
    return jsonData as unknown as T;
  }

  const rawData = payload.data as Record<string, unknown> | Array<Record<string, unknown>> | undefined;
  if (rawData) {
    if (Array.isArray(rawData)) {
      return rawData.map((item) => {
        const attrs = item.attributes as Record<string, unknown> | undefined;
        return attrs ? { id: item.id, ...attrs } : item;
      }) as unknown as T;
    }
    const singleAttrs = rawData.attributes as Record<string, unknown> | undefined;
    if (singleAttrs) {
      return { id: rawData.id, ...singleAttrs } as unknown as T;
    }
    return rawData as unknown as T;
  }
  return payload as unknown as T;
}

export function unwrapPaginatedJsonApiResponse<T>(
  payload: Record<string, unknown> | null | undefined
): SimplifiedPaginatedResponse<T> {
  if (!payload) {
    return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }

  const rawData = payload.data as Array<Record<string, unknown>> | undefined;
  const rawMeta = payload.meta as Record<string, unknown> | undefined;
  const rawLinks = payload.links as Record<string, unknown> | undefined;

  const pagination = rawMeta?.pagination as Record<string, unknown> | undefined;
  const meta: PaginationMeta = pagination
    ? {
        page: Number(pagination.page) || 1,
        limit: Number(pagination.limit) || 20,
        total: Number(pagination.total) || 0,
        totalPages: Number(pagination.totalPages) || 0,
      }
    : { page: 1, limit: 20, total: 0, totalPages: 0 };

  const data = rawData
    ? rawData.map((item) => {
        const attrs = item.attributes as Record<string, unknown> | undefined;
        return attrs ? ({ id: item.id, ...attrs } as T) : (item as T);
      })
    : [];

  return {
    data,
    meta: {
      ...meta,
      hasNext: rawLinks?.next !== null && rawLinks?.next !== undefined,
      hasPrev: rawLinks?.prev !== null && rawLinks?.prev !== undefined,
    },
    links: rawLinks as SimplifiedPaginatedResponse<T>['links'],
  };
}
