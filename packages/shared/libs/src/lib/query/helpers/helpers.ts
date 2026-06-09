/**
 * Query Helpers
 *
 * Utility functions for common query operations
 *
 * @module QueryHelpers
 */

import {
  QueryParams,
  FilterCondition,
  SortSpec,
  PaginationMode,
  SortDirection,
  FilterOperator,
  OffsetPagination,
  CursorPagination,
  PagePagination,
  QueryResult,
} from '../core/types.js';

/**
 * Normalize query parameters - convert simple params to advanced format
 */
export function normalizeQueryParams<TFilters extends Record<string, unknown>>(
  params: Partial<QueryParams<TFilters>>
): QueryParams<TFilters> {
  const normalized: QueryParams<TFilters> = {};

  // Normalize filters
  if (params.filters && params.filters.length > 0) {
    normalized.filters = params.filters;
  } else if (params.simpleFilters) {
    // Convert simple filters to filter conditions
    normalized.filters = Object.entries(params.simpleFilters)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([field, value]) => {
        // Auto-detect array values and use CONTAINS_ANY operator for array fields
        // This is useful for filtering array fields like tags, categories, etc.
        if (Array.isArray(value) && value.length > 0) {
          return {
            field,
            operator: FilterOperator.CONTAINS_ANY,
            value,
          };
        }
        return {
          field,
          operator: FilterOperator.EQ,
          value,
        };
      });
  }

  // Normalize sorting
  if (params.sort && params.sort.length > 0) {
    normalized.sort = params.sort;
  } else if (params.sortBy) {
    normalized.sort = [
      {
        field: params.sortBy,
        direction: params.sortDirection || SortDirection.ASC,
      },
    ];
  }

  // Normalize pagination
  if (params.pagination) {
    normalized.pagination = params.pagination;
  } else if (params.limit !== undefined) {
    if (params.cursor !== undefined) {
      normalized.pagination = {
        mode: PaginationMode.CURSOR,
        config: {
          limit: params.limit,
          cursor: params.cursor,
        },
      };
    } else {
      normalized.pagination = {
        mode: PaginationMode.OFFSET,
        config: {
          limit: params.limit,
          offset: params.offset || 0,
        },
      };
    }
  } else if (params.page !== undefined && params.pageSize !== undefined) {
    normalized.pagination = {
      mode: PaginationMode.PAGE,
      config: {
        page: params.page,
        pageSize: params.pageSize,
      },
    };
  }

  // Copy other fields
  if (params.fields) normalized.fields = params.fields;
  if (params.search) normalized.search = params.search;
  if (params.searchFields) normalized.searchFields = params.searchFields;
  if (params.metadata) normalized.metadata = params.metadata;

  return normalized;
}

/**
 * Extract pagination info from query params
 */
export function extractPagination(
  params: QueryParams
): OffsetPagination | CursorPagination | PagePagination | null {
  if (!params.pagination) {
    // Fallback to simple pagination
    if (params.limit !== undefined) {
      if (params.cursor !== undefined) {
        return {
          limit: params.limit,
          cursor: params.cursor,
        } as CursorPagination;
      }
      return {
        limit: params.limit,
        offset: params.offset || 0,
      } as OffsetPagination;
    }
    if (params.page !== undefined && params.pageSize !== undefined) {
      return {
        page: params.page,
        pageSize: params.pageSize,
      } as PagePagination;
    }
    return null;
  }

  return params.pagination.config;
}

/**
 * Extract filters from query params
 * Includes search filters when search term is provided
 */
export function extractFilters(params: QueryParams): FilterCondition[] {
  const filters: FilterCondition[] = [];

  // Add existing filters
  if (params.filters && params.filters.length > 0) {
    filters.push(...params.filters);
  } else if (params.simpleFilters) {
    // Convert simple filters to filter conditions
    const simpleFilterConditions = Object.entries(params.simpleFilters)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([field, value]) => ({
        field,
        operator: FilterOperator.EQ,
        value,
      }));
    filters.push(...simpleFilterConditions);
  }

  // Add search filters (search across specified fields with OR logic)
  // Note: Array fields (like tags) should NOT be included in searchFields
  // because Prisma doesn't support text search (contains) on array fields.
  // For array fields, use regular filters with hasSome/hasEvery operators.
  if (params.search && params.search.trim()) {
    // Default to common text fields only (not array fields)
    const searchFields = params.searchFields?.length 
      ? params.searchFields 
      : ['title', 'description'];

    // Filter out known array fields that don't support text search
    const ARRAY_FIELDS = ['tags', 'categories', 'keywords'];
    const textSearchFields = searchFields.filter(
      field => !ARRAY_FIELDS.includes(field)
    );

    // Create OR group for search across multiple text fields
    if (textSearchFields.length > 0) {
      const searchConditions = textSearchFields.map(field => ({
        field,
        operator: FilterOperator.CONTAINS,
        value: params.search,
      }));

      // If only one search field, use simple condition
      // If multiple, wrap in OR
      if (searchConditions.length === 1) {
        filters.push(searchConditions[0]);
      } else {
        filters.push({
          operator: FilterOperator.OR,
          conditions: searchConditions,
        });
      }
    }
  }

  return filters;
}

/**
 * Extract sorts from query params
 */
export function extractSorts(params: QueryParams): SortSpec[] {
  if (params.sort && params.sort.length > 0) {
    return params.sort;
  }

  if (params.sortBy) {
    return [
      {
        field: params.sortBy,
        direction: params.sortDirection || SortDirection.ASC,
      },
    ];
  }

  return [];
}

/**
 * Create a search filter from search query
 */
export function createSearchFilter(
  search: string,
  fields: string[] = []
): FilterCondition[] {
  if (!search || fields.length === 0) {
    return [];
  }

  if (fields.length === 1) {
    return [
      {
        field: fields[0],
        operator: FilterOperator.CONTAINS,
        value: search,
      },
    ];
  }

  // Multiple fields - use OR
  return [
    {
      operator: FilterOperator.OR,
      conditions: fields.map((field) => ({
        field,
        operator: FilterOperator.CONTAINS,
        value: search,
      })),
    },
  ];
}

/**
 * Merge multiple filter conditions
 */
export function mergeFilters(
  ...filters: FilterCondition[][]
): FilterCondition[] {
  const allFilters = filters.flat();
  if (allFilters.length === 0) return [];

  if (allFilters.length === 1) return allFilters;

  // Wrap multiple filters in AND
  return [
    {
      operator: FilterOperator.AND,
      conditions: allFilters,
    },
  ];
}

/**
 * Validate field names against allowed list
 */
export function validateFields(
  fields: string[],
  allowedFields: string[]
): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const field of fields) {
    if (allowedFields.includes(field)) {
      valid.push(field);
    } else {
      invalid.push(field);
    }
  }

  return { valid, invalid };
}

/**
 * Sanitize limit value
 */
export function sanitizeLimit(
  limit: number | undefined,
  maxLimit = 100,
  defaultLimit = 20
): number {
  if (limit === undefined) return defaultLimit;
  if (limit < 1) return defaultLimit;
  if (limit > maxLimit) return maxLimit;
  return limit;
}

/**
 * Sanitize offset value
 */
export function sanitizeOffset(offset: number | undefined): number {
  if (offset === undefined) return 0;
  if (offset < 0) return 0;
  return offset;
}

/**
 * Sanitize page value
 */
export function sanitizePage(page: number | undefined): number {
  if (page === undefined) return 1;
  if (page < 1) return 1;
  return page;
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  if (total === 0) return 0;
  return Math.ceil(total / pageSize);
}

/**
 * Create query result with pagination metadata (internal format)
 * @deprecated Use createJsonApiPaginatedResponse() for direct JSON:API responses
 * This function is kept for backward compatibility only
 */
export function createPaginatedResult<T>(
  data: T[],
  total: number | undefined,
  pagination: OffsetPagination | CursorPagination | PagePagination
): QueryResult<T> {
  if ('page' in pagination) {
    // Page-based
    const pagePagination = pagination as PagePagination;
    const totalPages =
      total !== undefined
        ? calculateTotalPages(total, pagePagination.pageSize)
        : undefined;

    if (total === undefined) {
      throw new Error('Total count is required for page-based pagination');
    }

    return {
      items: data,
      pagination: {
        page: pagePagination.page,
        limit: pagePagination.pageSize,
        total,
        totalPages: totalPages || 1,
      },
    };
  }

  if ('cursor' in pagination) {
    // Cursor-based: convert to page-based for JSON:API compatibility
    const cursorPagination = pagination as CursorPagination;
    if (total === undefined) {
      throw new Error(
        'Total count is required for cursor-based pagination conversion'
      );
    }
    // Estimate page from cursor position (simplified - assumes sequential IDs)
    const estimatedPage = 1; // Default, should be calculated from cursor if possible
    const totalPages = Math.ceil(total / cursorPagination.limit);

    return {
      items: data,
      pagination: {
        page: estimatedPage,
        limit: cursorPagination.limit,
        total,
        totalPages,
      },
    };
  }

  // Offset-based
  const offsetPagination = pagination as OffsetPagination;
  if (total === undefined) {
    throw new Error('Total count is required for offset-based pagination');
  }
  const page = Math.floor(offsetPagination.offset / offsetPagination.limit) + 1;
  const totalPages = Math.ceil(total / offsetPagination.limit);

  return {
    items: data,
    pagination: {
      page,
      limit: offsetPagination.limit,
      total,
      totalPages,
    },
  };
}

/**
 * Parse query string to QueryParams (for URL query strings)
 */
export function parseQueryString(
  queryString: string | Record<string, string | string[] | undefined>
): Partial<QueryParams> {
  const params: Partial<QueryParams> = {};

  if (typeof queryString === 'string') {
    const query = new URLSearchParams(queryString);

    // Parse limit/offset
    const limitStr = query.get('limit');
    if (limitStr) {
      const limit = parseInt(limitStr, 10);
      if (!isNaN(limit)) params.limit = limit;
    }
    const offsetStr = query.get('offset');
    if (offsetStr) {
      const offset = parseInt(offsetStr, 10);
      if (!isNaN(offset)) params.offset = offset;
    }

    // Parse page/pageSize
    const pageStr = query.get('page');
    if (pageStr) {
      const page = parseInt(pageStr, 10);
      if (!isNaN(page)) params.page = page;
    }
    const pageSizeStr = query.get('pageSize');
    if (pageSizeStr) {
      const pageSize = parseInt(pageSizeStr, 10);
      if (!isNaN(pageSize)) params.pageSize = pageSize;
    }

    // Parse cursor
    const cursor = query.get('cursor');
    if (cursor) {
      params.cursor = cursor;
    }

    // Parse sort
    const sortBy = query.get('sortBy');
    if (sortBy) {
      params.sortBy = sortBy;
    }
    const sortDirection = query.get('sortDirection');
    if (sortDirection) {
      params.sortDirection = sortDirection as SortDirection;
    }

    // Parse search
    const search = query.get('search') || query.get('q');
    if (search) {
      params.search = search;
    }
    const searchFields = query.getAll('searchFields');
    if (searchFields.length > 0) {
      params.searchFields = searchFields;
    }
  } else {
    // Handle Record<string, string | string[] | undefined>
    const query = queryString;

    // Parse limit/offset
    if (query.limit) {
      const limit = parseInt(String(query.limit), 10);
      if (!isNaN(limit)) params.limit = limit;
    }
    if (query.offset) {
      const offset = parseInt(String(query.offset), 10);
      if (!isNaN(offset)) params.offset = offset;
    }

    // Parse page/pageSize
    if (query.page) {
      const page = parseInt(String(query.page), 10);
      if (!isNaN(page)) params.page = page;
    }
    if (query.pageSize) {
      const pageSize = parseInt(String(query.pageSize), 10);
      if (!isNaN(pageSize)) params.pageSize = pageSize;
    }

    // Parse cursor
    if (query.cursor) {
      params.cursor = String(query.cursor);
    }

    // Parse sort
    if (query.sortBy) {
      params.sortBy = String(query.sortBy);
    }
    if (query.sortDirection) {
      params.sortDirection = String(query.sortDirection) as SortDirection;
    }

    // Parse search
    if (query.search || query.q) {
      params.search = String(query.search || query.q);
    }
    if (query.searchFields) {
      const fields = Array.isArray(query.searchFields)
        ? query.searchFields
        : [query.searchFields];
      params.searchFields = fields.map(String);
    }
  }

  return params;
}
