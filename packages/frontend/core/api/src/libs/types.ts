/**
 * Type definitions for API hooks
 * Following React Query v5 and JSON:API specification
 */

// ==================== JSON:API Types ====================

/**
 * JSON:API Resource Object
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export interface ResourceObject<TAttributes = Record<string, unknown>> {
  id: string;
  type: string;
  attributes: TAttributes;
  relationships?: Record<string, unknown>;
  links?: { self?: string };
  meta?: Record<string, unknown>;
}

/**
 * JSON:API Single Resource Response
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface JsonApiResponse<TAttributes = Record<string, unknown>> {
  data: ResourceObject<TAttributes>;
  links?: {
    self?: string;
    [key: string]: string | undefined;
  };
  meta?: ResponseMeta;
  included?: ResourceObject[];
  errors?: JsonApiError[];
}

/**
 * JSON:API Paginated Response
 * @see https://jsonapi.org/format/#fetching-pagination
 */
export interface JsonApiPaginatedResponse<TAttributes = Record<string, unknown>> {
  data: ResourceObject<TAttributes>[];
  links?: {
    self?: string;
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
  meta?: ResponseMeta;
  included?: ResourceObject[];
  errors?: JsonApiError[];
}

/**
 * JSON:API Error Object
 * @see https://jsonapi.org/format/#errors
 */
export interface JsonApiError {
  id?: string;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  meta?: Record<string, unknown>;
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  timestamp?: string;
  version?: string;
  message?: string;
  requestId?: string;
  pagination?: PaginationMeta;
  [key: string]: unknown;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// ==================== Simplified Response Types ====================

/**
 * Simplified paginated response (extracted attributes)
 * This is the format returned by hooks by default
 */
export interface SimplifiedPaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta & {
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  links?: JsonApiPaginatedResponse['links'];
}

/**
 * Extract attributes from JSON:API ResourceObject
 */
export type ExtractAttributes<T> = T extends ResourceObject<infer A> ? A : T;

// ==================== Query Parameters ====================

/**
 * Sort specification
 */
export interface SortSpec {
  field: string;
  direction: 'asc' | 'desc';
  priority?: number;
}

/**
 * Field selection
 */
export interface FieldSelection {
  include?: string[];
  exclude?: string[];
  relations?: string[];
}

/**
 * Filter condition
 */
export interface FilterCondition {
  field: string;
  operator: string;
  value?: unknown;
  value2?: unknown;
  conditions?: FilterCondition[];
}

/**
 * Query parameters for API requests
 * Supports both simple and advanced query params
 */
export interface ApiQueryParams {
  // Simple pagination (backward compatibility)
  page?: number;
  limit?: number;
  offset?: number;
  pageSize?: number;
  
  // Simple sort (backward compatibility)
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Advanced sort
  sort?: SortSpec[];
  
  // Simple search
  search?: string;
  q?: string; // Alias for search
  searchFields?: string[];
  
  // Simple filters (key-value pairs)
  filters?: Record<string, string | number | boolean | string[] | undefined> | FilterCondition[];
  
  // Advanced filters
  filterConditions?: FilterCondition[];
  
  // Field selection
  fields?: FieldSelection;
  
  // Pagination config (advanced)
  pagination?: {
    mode?: 'offset' | 'cursor' | 'page';
    config?: {
      limit?: number;
      offset?: number;
      cursor?: string;
      page?: number;
      pageSize?: number;
      direction?: 'forward' | 'backward';
    };
  };
}

