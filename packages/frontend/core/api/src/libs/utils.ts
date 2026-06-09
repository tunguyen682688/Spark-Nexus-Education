/**
 * Utility functions for API hooks
 */

import type {
  ApiQueryParams,
  FilterCondition,
  SortSpec,
  JsonApiPaginatedResponse,
  SimplifiedPaginatedResponse,
  PaginationMeta,
} from './types';

/**
 * Convert JSON:API response to simplified format (extract attributes)
 */
export function extractAttributes<TAttributes>(
  response: JsonApiPaginatedResponse<TAttributes>
): SimplifiedPaginatedResponse<TAttributes> {
  const pagination = response.meta?.pagination;
  const meta: PaginationMeta = pagination || {
    page: 1,
    limit: response.data.length,
    total: response.data.length,
    totalPages: 1,
  };
  
  return {
    data: response.data.map((item) => item.attributes),
    meta: {
      ...meta,
      hasNext: response.links?.next !== null && response.links?.next !== undefined,
      hasPrev: response.links?.prev !== null && response.links?.prev !== undefined,
    },
    links: response.links,
  };
}

/**
 * Build query string from API query params
 * Follows standard query string conventions
 */
export function buildQueryString(params?: ApiQueryParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  // Pagination - support both page/pageSize and offset/limit
  if (params.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  if (params.pageSize !== undefined) {
    searchParams.append('pageSize', params.pageSize.toString());
  } else if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.append('offset', params.offset.toString());
  }

  // Sorting - support both simple and advanced
  if (params.sortBy) {
    searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) {
      searchParams.append('sortDirection', params.sortOrder);
    }
  }
  // Advanced sort
  if (params.sort && params.sort.length > 0) {
    params.sort.forEach((spec: SortSpec, index: number) => {
      searchParams.append(`sort[${index}][field]`, spec.field);
      searchParams.append(`sort[${index}][direction]`, spec.direction);
      if (spec.priority !== undefined) {
        searchParams.append(`sort[${index}][priority]`, spec.priority.toString());
      }
    });
  }

  // Search
  const searchQuery = params.search || params.q;
  if (searchQuery) {
    searchParams.append('search', searchQuery);
    if (params.searchFields && params.searchFields.length > 0) {
      params.searchFields.forEach((field: string) => {
        searchParams.append('searchFields[]', field);
      });
    }
  }

  // Simple filters (key-value pairs) - only if not an array
  if (params.filters && !Array.isArray(params.filters)) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(`${key}[]`, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
  }

  // Advanced filters
  if (params.filterConditions && Array.isArray(params.filterConditions)) {
    params.filterConditions.forEach((condition: FilterCondition, index: number) => {
      if ('field' in condition) {
        searchParams.append(`filters[${index}][field]`, condition.field);
        searchParams.append(`filters[${index}][operator]`, condition.operator);
        if (condition.value !== undefined) {
          searchParams.append(`filters[${index}][value]`, String(condition.value));
        }
      }
    });
  }
  
  // Also check if filters is an array (FilterCondition[])
  if (params.filters && Array.isArray(params.filters)) {
    params.filters.forEach((condition: FilterCondition, index: number) => {
      if ('field' in condition) {
        searchParams.append(`filters[${index}][field]`, condition.field);
        searchParams.append(`filters[${index}][operator]`, condition.operator);
        if (condition.value !== undefined) {
          searchParams.append(`filters[${index}][value]`, String(condition.value));
        }
      }
    });
  }

  // Field selection
  if (params.fields) {
    if (params.fields.include) {
      params.fields.include.forEach((field: string) => {
        searchParams.append('fields[include][]', field);
      });
    }
    if (params.fields.exclude) {
      params.fields.exclude.forEach((field: string) => {
        searchParams.append('fields[exclude][]', field);
      });
    }
    if (params.fields.relations) {
      params.fields.relations.forEach((relation: string) => {
        searchParams.append('fields[relations][]', relation);
      });
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

