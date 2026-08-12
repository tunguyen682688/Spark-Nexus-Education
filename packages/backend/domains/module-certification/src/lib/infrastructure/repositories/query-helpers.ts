import { Prisma } from '@prisma/client';
import {
  extractPagination,
  sanitizeLimit,
  sanitizePage,
  PagePagination,
  OffsetPagination,
} from '@spark-nest-ed/shared-libs';

/**
 * Recursively removes specified keys from a Prisma where clause object.
 * Used to strip relation-filter keys (e.g. `exam`) that aren't valid
 * on the current model's where input.
 */
export function stripKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: string[]
): T {
  if (!obj || typeof obj !== 'object') return obj;
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (keys.includes(k)) continue;
    if (Array.isArray(v)) {
      result[k] = v.map((item) =>
        item && typeof item === 'object'
          ? stripKeys(item as Record<string, unknown>, keys)
          : item
      );
    } else if (v && typeof v === 'object') {
      result[k] = stripKeys(v as Record<string, unknown>, keys);
    } else {
      result[k] = v;
    }
  }
  return result as T;
}

/**
 * Filters an orderBy value to only include keys in the allowed set.
 * Falls back to `{ updatedAt: 'desc' }` if no valid keys remain.
 */
export function sanitizeSortField(
  order: unknown,
  allowedFields: Set<string>,
  fallback: Record<string, Prisma.SortOrder> = { updatedAt: 'desc' }
): unknown {
  if (Array.isArray(order)) {
    return order.map((item) => {
      if (item && typeof item === 'object') {
        const entries = Object.entries(item as Record<string, unknown>).filter(
          ([k]) => allowedFields.has(k)
        );
        return entries.length > 0 ? Object.fromEntries(entries) : fallback;
      }
      return item;
    });
  }
  if (order && typeof order === 'object') {
    const entries = Object.entries(order as Record<string, unknown>).filter(
      ([k]) => allowedFields.has(k)
    );
    return entries.length > 0 ? Object.fromEntries(entries) : fallback;
  }
  return order;
}

/**
 * Resolves the non-empty orderBy from a Prisma query result,
 * falling back to the default if empty.
 */
export function resolveOrderBy(
  orderBy: unknown,
  defaultOrderBy: Record<string, Prisma.SortOrder> = { createdAt: 'desc' }
): unknown {
  if (
    orderBy &&
    (Array.isArray(orderBy)
      ? orderBy.length > 0
      : typeof orderBy === 'object' && Object.keys(orderBy).length > 0)
  ) {
    return orderBy;
  }
  return defaultOrderBy;
}

/**
 * Derives page and limit from extracted pagination metadata.
 * Handles both page-based and offset-based pagination.
 */
export function derivePaginationMeta(
  pagination: ReturnType<typeof extractPagination>,
  fallbackTake?: number
): { page: number; limit: number } {
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;

  if (pagination && 'page' in pagination) {
    const pp = pagination as PagePagination;
    return {
      page: sanitizePage(pp.page),
      limit: sanitizeLimit(pp.pageSize, MAX_LIMIT, DEFAULT_LIMIT),
    };
  }
  if (pagination && 'offset' in pagination) {
    const op = pagination as OffsetPagination;
    const limit = sanitizeLimit(op.limit, MAX_LIMIT, DEFAULT_LIMIT);
    return {
      page: Math.floor(op.offset / Math.max(limit, 1)) + 1,
      limit,
    };
  }
  return { page: 1, limit: fallbackTake || DEFAULT_LIMIT };
}

/**
 * Merges a search term into an existing Prisma where clause using OR
 * on the specified fields. If the where clause already has a title filter,
 * it is preserved via AND.
 */
export function mergeSearchFilter(
  where: Record<string, unknown>,
  searchTerm: string | undefined,
  searchFields: string[]
): void {
  if (!searchTerm?.trim()) return;
  const term = searchTerm.trim();
  const orFilters = searchFields.map((field) => ({
    [field]: { contains: term, mode: 'insensitive' as const },
  }));
  const searchClause = { OR: orFilters };
  if (Array.isArray(where.AND)) {
    where.AND.push(searchClause);
  } else {
    where.AND = [searchClause];
  }
}
