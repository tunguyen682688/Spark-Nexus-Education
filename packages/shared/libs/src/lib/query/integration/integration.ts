/**
 * Query System Integration Utilities
 *
 * Utilities for integrating the query system with NestJS, Prisma, and other frameworks
 *
 * @module QueryIntegration
 */

import {
  QueryParams,
  FilterCondition,
  QueryResult,
  OffsetPagination,
  SortDirection,
} from '../core/types.js';
import {
  toPrismaWhere,
  toPrismaOrderBy,
} from '../transformers/transformers.js';
import {
  extractFilters,
  extractSorts,
  extractPagination,
  normalizeQueryParams,
  createPaginatedResult,
  sanitizeLimit,
  sanitizeOffset,
} from '../helpers/helpers.js';

/**
 * Options for building Prisma query
 */
export interface PrismaQueryOptions {
  includeCount?: boolean;
  maxLimit?: number;
  defaultLimit?: number;
}

/**
 * Result of building Prisma query
 */
export interface PrismaQueryResult {
  where: Record<string, unknown>;
  orderBy: Record<string, unknown> | Record<string, unknown>[];
  take?: number;
  skip?: number;
  cursor?: Record<string, unknown>;
}

/**
 * Build Prisma query from QueryParams
 */
export function buildPrismaQuery(
  params: QueryParams,
  options: PrismaQueryOptions = {}
): PrismaQueryResult {
  const { maxLimit = 100, defaultLimit = 20 } = options;

  // Normalize params
  const normalized = normalizeQueryParams(params);

  // Extract components
  const filters = extractFilters(normalized);
  const sorts = extractSorts(normalized);
  const pagination = extractPagination(normalized);

  // Build Prisma query
  const where = toPrismaWhere(filters);
  const orderBy = toPrismaOrderBy(sorts);

  // Handle pagination
  let paginationParams: {
    take?: number;
    skip?: number;
    cursor?: Record<string, unknown>;
  } = {};

  if (pagination) {
    if ('limit' in pagination) {
      // Offset or cursor based
      if ('cursor' in pagination) {
        // Cursor-based
        paginationParams = {
          take: sanitizeLimit(pagination.limit, maxLimit, defaultLimit),
          cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
        };
      } else {
        // Offset-based
        const offsetPagination = pagination as OffsetPagination;
        paginationParams = {
          take: sanitizeLimit(offsetPagination.limit, maxLimit, defaultLimit),
          skip: sanitizeOffset(offsetPagination.offset),
        };
      }
    } else if ('page' in pagination) {
      // Page-based
      const pageSize = sanitizeLimit(
        pagination.pageSize,
        maxLimit,
        defaultLimit
      );
      paginationParams = {
        take: pageSize,
        skip: (pagination.page - 1) * pageSize,
      };
    }
  } else {
    // Default pagination
    paginationParams = {
      take: defaultLimit,
      skip: 0,
    };
  }

  return {
    where,
    orderBy,
    ...paginationParams,
  };
}

/**
 * Execute Prisma query and return paginated result (internal format)
 * @deprecated Use executePrismaQueryToJsonApi() for direct JSON:API responses
 */
export async function executePrismaQuery<T>(
  prismaClient: {
    findMany: (args: {
      where: Record<string, unknown>;
      orderBy: Record<string, unknown> | Record<string, unknown>[];
      take?: number;
      skip?: number;
      cursor?: Record<string, unknown>;
    }) => Promise<T[]>;
    count?: (args: { where: Record<string, unknown> }) => Promise<number>;
  },
  params: QueryParams,
  options: PrismaQueryOptions = {}
): Promise<QueryResult<T>> {
  const queryResult = buildPrismaQuery(params, options);
  const pagination = extractPagination(normalizeQueryParams(params));

  // Execute query
  const [data, total] = await Promise.all([
    prismaClient.findMany(queryResult),
    options.includeCount && prismaClient.count
      ? prismaClient.count({ where: queryResult.where })
      : Promise.resolve(undefined),
  ]);

  // Build pagination config for result
  let paginationConfig = pagination;
  if (!paginationConfig && queryResult.take) {
    if (queryResult.cursor) {
      paginationConfig = {
        limit: queryResult.take,
        cursor: String(queryResult.cursor.id),
      };
    } else {
      paginationConfig = {
        limit: queryResult.take,
        offset: queryResult.skip || 0,
      };
    }
  }

  if (!paginationConfig) {
    paginationConfig = {
      limit: options.defaultLimit || 20,
      offset: 0,
    };
  }

  return createPaginatedResult(data, total, paginationConfig);
}

/**
 * Merge additional filters with query params
 */
export function mergeQueryFilters(
  params: QueryParams,
  additionalFilters: FilterCondition[]
): QueryParams {
  const normalized = normalizeQueryParams(params);
  const existingFilters = extractFilters(normalized);

  return {
    ...normalized,
    filters: [...existingFilters, ...additionalFilters],
  };
}

/**
 * Add default filters to query params
 */
export function addDefaultFilters(
  params: QueryParams,
  defaultFilters: FilterCondition[]
): QueryParams {
  const normalized = normalizeQueryParams(params);
  const existingFilters = extractFilters(normalized);

  // Prepend default filters
  return {
    ...normalized,
    filters: [...defaultFilters, ...existingFilters],
  };
}

/**
 * Validate and sanitize query params
 */
export function validateQueryParams(
  params: QueryParams,
  options: {
    maxLimit?: number;
    defaultLimit?: number;
    allowedSortFields?: string[];
    allowedFilterFields?: string[];
  } = {}
): QueryParams {
  const {
    maxLimit = 100,
    defaultLimit = 20,
    allowedSortFields,
    allowedFilterFields,
  } = options;

  const normalized = normalizeQueryParams(params);

  // Sanitize pagination
  if (normalized.pagination) {
    if (normalized.pagination.mode === 'offset') {
      normalized.pagination.config.limit = sanitizeLimit(
        normalized.pagination.config.limit,
        maxLimit,
        defaultLimit
      );
      normalized.pagination.config.offset = sanitizeOffset(
        normalized.pagination.config.offset
      );
    } else if (normalized.pagination.mode === 'page') {
      normalized.pagination.config.pageSize = sanitizeLimit(
        normalized.pagination.config.pageSize,
        maxLimit,
        defaultLimit
      );
    } else if (normalized.pagination.mode === 'cursor') {
      normalized.pagination.config.limit = sanitizeLimit(
        normalized.pagination.config.limit,
        maxLimit,
        defaultLimit
      );
    }
  } else if (normalized.limit !== undefined) {
    normalized.limit = sanitizeLimit(normalized.limit, maxLimit, defaultLimit);
    normalized.offset = sanitizeOffset(normalized.offset);
  }

  // Validate sort fields
  if (allowedSortFields && normalized.sort) {
    normalized.sort = normalized.sort.filter((sort) =>
      allowedSortFields.includes(sort.field)
    );
  }

  // Validate filter fields
  if (allowedFilterFields) {
    const filters = extractFilters(normalized);
    const validatedFilters = filters.filter((filter) => {
      if ('field' in filter) {
        return allowedFilterFields.includes(filter.field);
      }
      // For nested filters, validate recursively
      if ('conditions' in filter) {
        return filter.conditions.some((condition) => {
          if ('field' in condition) {
            return allowedFilterFields.includes(condition.field);
          }
          return true;
        });
      }
      return true;
    });

    if (validatedFilters.length !== filters.length) {
      normalized.filters = validatedFilters;
    }
  }

  return normalized;
}

/**
 * Reserved keys that should not be treated as simple filters
 */
const RESERVED_KEYS = [
  'limit',
  'offset',
  'page',
  'pageSize',
  'cursor',
  'sortBy',
  'sortDirection',
  'search',
  'q',
  'searchFields',
  'sort',
  'filters',
];

/**
 * Check if a key is an array-indexed key (e.g., "sort[0][field]", "filters[1][value]")
 */
function isArrayIndexedKey(key: string): boolean {
  return /^\w+\[\d+\]/.test(key);
}

/**
 * Parse array-indexed query params into structured objects
 * e.g., { "sort[0][field]": "createdAt", "sort[0][direction]": "desc" }
 * becomes { sort: [{ field: "createdAt", direction: "desc" }] }
 */
function parseArrayIndexedParams(
  obj: Record<string, unknown>
): Record<string, unknown[]> {
  const result: Record<string, Record<number, Record<string, unknown>>> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Match patterns like "sort[0][field]" or "filters[1][value]"
    const match = key.match(/^(\w+)\[(\d+)\]\[(\w+)\]$/);
    if (match) {
      const [, arrayName, indexStr, propName] = match;
      const index = parseInt(indexStr, 10);

      if (!result[arrayName]) {
        result[arrayName] = {};
      }
      if (!result[arrayName][index]) {
        result[arrayName][index] = {};
      }
      result[arrayName][index][propName] = value;
    }

    // Match patterns like "searchFields[0]" (simple indexed array)
    const simpleMatch = key.match(/^(\w+)\[(\d+)\]$/);
    if (simpleMatch && !match) {
      const [, arrayName, indexStr] = simpleMatch;
      const index = parseInt(indexStr, 10);

      if (!result[arrayName]) {
        result[arrayName] = {};
      }
      result[arrayName][index] = { value };
    }
  }

  // Convert indexed objects to arrays
  const arrays: Record<string, unknown[]> = {};
  for (const [arrayName, indexedObj] of Object.entries(result)) {
    const indices = Object.keys(indexedObj)
      .map(Number)
      .sort((a, b) => a - b);
    arrays[arrayName] = indices.map((i) => {
      const item = indexedObj[i];
      // For simple indexed arrays (like searchFields[0]), extract just the value
      if (item && 'value' in item && Object.keys(item).length === 1) {
        return item.value;
      }
      return item;
    });
  }

  return arrays;
}

/**
 * Create query params from simple object (for backward compatibility)
 * Handles both simple key-value params and array-indexed params like:
 * - sort[0][field]=createdAt&sort[0][direction]=desc
 * - filters[0][field]=status&filters[0][operator]=eq&filters[0][value]=active
 */
export function createQueryParamsFromObject(
  obj: Record<string, unknown>
): QueryParams {
  const params: QueryParams = {};

  // Parse array-indexed params first
  const arrayParams = parseArrayIndexedParams(obj);

  // Handle sort array from parsed params
  if (arrayParams.sort && Array.isArray(arrayParams.sort)) {
    params.sort = arrayParams.sort
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' && item !== null && 'field' in item
      )
      .map((item) => ({
        field: String(item.field),
        direction: (item.direction as SortDirection) || SortDirection.ASC,
        priority: item.priority !== undefined ? Number(item.priority) : undefined,
      }));
  }

  // Handle filters array from parsed params
  if (arrayParams.filters && Array.isArray(arrayParams.filters)) {
    params.filters = arrayParams.filters
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' &&
          item !== null &&
          'field' in item &&
          'operator' in item
      )
      .map((item) => ({
        field: String(item.field),
        operator: String(item.operator),
        value: item.value,
        value2: item.value2,
      })) as FilterCondition[];
  }

  // Handle searchFields array from parsed params
  if (arrayParams.searchFields && Array.isArray(arrayParams.searchFields)) {
    params.searchFields = arrayParams.searchFields
      .filter((item): item is string => typeof item === 'string')
      .map(String);
  }

  // Reserved array param names that have special handling
  const RESERVED_ARRAY_PARAMS = ['sort', 'filters', 'searchFields'];

  // Handle other array-indexed params as simple filters with array values
  // e.g., tags[0]=TOEIC&tags[1]=IELTS becomes simpleFilters.tags = ['TOEIC', 'IELTS']
  for (const [arrayName, arrayValue] of Object.entries(arrayParams)) {
    if (!RESERVED_ARRAY_PARAMS.includes(arrayName) && Array.isArray(arrayValue)) {
      if (!params.simpleFilters) {
        params.simpleFilters = {};
      }
      // Extract simple string values from the array
      params.simpleFilters[arrayName] = arrayValue.filter(
        (item): item is string => typeof item === 'string'
      );
    }
  }

  // Collect keys that are reserved or array-indexed (to exclude from simpleFilters)
  const excludeKeys = new Set<string>([
    ...RESERVED_KEYS,
    ...Object.keys(obj).filter(isArrayIndexedKey),
  ]);

  // Simple filters - only include keys that are not reserved or array-indexed
  const filterKeys = Object.keys(obj).filter((key) => !excludeKeys.has(key));

  if (filterKeys.length > 0) {
    if (!params.simpleFilters) {
      params.simpleFilters = {};
    }
    for (const key of filterKeys) {
      const value = obj[key];
      if (value !== undefined && value !== null) {
        // Convert string "true"/"false" to boolean for common filter fields
        if (value === 'true') {
          params.simpleFilters[key] = true;
        } else if (value === 'false') {
          params.simpleFilters[key] = false;
        } else {
          params.simpleFilters[key] = value;
        }
      }
    }
  }

  // Pagination
  if (obj.limit !== undefined) {
    params.limit = Number(obj.limit);
  }
  if (obj.offset !== undefined) {
    params.offset = Number(obj.offset);
  }
  if (obj.page !== undefined) {
    params.page = Number(obj.page);
  }

  // Auto-calculate offset from page and limit if offset is missing
  // This ensures compatibility when frontend sends page/limit but backend expects offset/limit
  if (params.page !== undefined && params.limit !== undefined && params.offset === undefined) {
    const page = Math.max(1, params.page);
    params.offset = (page - 1) * params.limit;
  }

  if (obj.pageSize !== undefined) {
    params.pageSize = Number(obj.pageSize);
  }
  if (obj.cursor !== undefined) {
    params.cursor = String(obj.cursor);
  }

  // Sorting (simple format - sortBy/sortDirection)
  if (obj.sortBy !== undefined && !params.sort?.length) {
    params.sortBy = String(obj.sortBy);
  }
  if (obj.sortDirection !== undefined && !params.sort?.length) {
    params.sortDirection = String(obj.sortDirection) as SortDirection;
  }

  // Search
  if (obj.search !== undefined || obj.q !== undefined) {
    params.search = String(obj.search || obj.q);
  }
  // Handle searchFields from direct array (not indexed)
  if (obj.searchFields !== undefined && !params.searchFields?.length) {
    params.searchFields = Array.isArray(obj.searchFields)
      ? obj.searchFields.map(String)
      : [String(obj.searchFields)];
  }

  return normalizeQueryParams(params);
}
