/**
 * Advanced Query Parameter System
 *
 * A comprehensive, type-safe query parameter system for building
 * enterprise-grade APIs with filtering, sorting, pagination, and more.
 *
 * @module QueryTypes
 */

/**
 * Filter operators for advanced querying
 */
export enum FilterOperator {
  // Comparison operators
  EQ = 'eq', // Equals
  NE = 'ne', // Not equals
  GT = 'gt', // Greater than
  GTE = 'gte', // Greater than or equal
  LT = 'lt', // Less than
  LTE = 'lte', // Less than or equal

  // String operators
  CONTAINS = 'contains', // Contains substring
  STARTS_WITH = 'startsWith', // Starts with
  ENDS_WITH = 'endsWith', // Ends with
  REGEX = 'regex', // Regular expression match

  // Array/Collection operators
  IN = 'in', // In array
  NOT_IN = 'notIn', // Not in array
  CONTAINS_ALL = 'containsAll', // Contains all elements
  CONTAINS_ANY = 'containsAny', // Contains any element
  IS_EMPTY = 'isEmpty', // Is empty array/string
  IS_NOT_EMPTY = 'isNotEmpty', // Is not empty

  // Null/Undefined operators
  IS_NULL = 'isNull', // Is null
  IS_NOT_NULL = 'isNotNull', // Is not null

  // Date/Time operators
  BETWEEN = 'between', // Between two values
  BEFORE = 'before', // Before date
  AFTER = 'after', // After date

  // Logical operators (for nested queries)
  AND = 'and', // Logical AND
  OR = 'or', // Logical OR
  NOT = 'not', // Logical NOT
}

/**
 * Sort direction
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Pagination mode
 */
export enum PaginationMode {
  OFFSET = 'offset', // Offset-based pagination
  CURSOR = 'cursor', // Cursor-based pagination
  PAGE = 'page', // Page-based pagination
}

/**
 * Base filter condition
 */
export interface BaseFilterCondition<T = unknown> {
  field: string;
  operator: FilterOperator;
  value?: T;
  value2?: T; // For BETWEEN operator
}

/**
 * Nested filter condition (for AND/OR/NOT)
 */
export interface NestedFilterCondition {
  operator: FilterOperator.AND | FilterOperator.OR | FilterOperator.NOT;
  conditions: FilterCondition[];
}

/**
 * Filter condition - can be base or nested
 */
export type FilterCondition = BaseFilterCondition | NestedFilterCondition;

/**
 * Sort specification
 */
export interface SortSpec {
  field: string;
  direction: SortDirection;
  priority?: number; // For multi-field sorting
}

/**
 * Offset-based pagination
 */
export interface OffsetPagination {
  limit: number;
  offset: number;
}

/**
 * Cursor-based pagination
 */
export interface CursorPagination {
  limit: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

/**
 * Page-based pagination
 */
export interface PagePagination {
  page: number;
  pageSize: number;
}

/**
 * Pagination configuration
 */
export type PaginationConfig =
  | { mode: PaginationMode.OFFSET; config: OffsetPagination }
  | { mode: PaginationMode.CURSOR; config: CursorPagination }
  | { mode: PaginationMode.PAGE; config: PagePagination };

/**
 * Field selection configuration
 */
export interface FieldSelection {
  include?: string[]; // Fields to include
  exclude?: string[]; // Fields to exclude
  relations?: string[]; // Relations to include
}

/**
 * Query metadata
 */
export interface QueryMetadata {
  includeCount?: boolean; // Include total count
  includeMetadata?: boolean; // Include query metadata
  maxLimit?: number; // Maximum allowed limit
  defaultLimit?: number; // Default limit if not specified
}

/**
 * Complete query parameters structure
 */
export interface QueryParams<
  TFilters extends Record<string, unknown> = Record<string, unknown>
> {
  // Filtering
  filters?: FilterCondition[];
  // Simple filters (backward compatibility)
  simpleFilters?: Partial<TFilters>;

  // Sorting
  sort?: SortSpec[];
  // Simple sort (backward compatibility)
  sortBy?: string;
  sortDirection?: SortDirection;

  // Pagination
  pagination?: PaginationConfig;
  // Simple pagination (backward compatibility)
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
  cursor?: string;

  // Field selection
  fields?: FieldSelection;

  // Search
  search?: string;
  searchFields?: string[]; // Fields to search in

  // Metadata
  metadata?: QueryMetadata;
}

/**
 * Internal query result structure (for database operations)
 * This is an intermediate type used before converting to JSON:API format
 *
 * @deprecated Use PaginatedResponse from JSON:API for API responses
 * This type is kept only for internal query operations
 */
export interface QueryResult<T> {
  items: T[];
  pagination: PaginationMeta;
  metadata?: {
    queryTime?: number;
    filters?: FilterCondition[];
    sort?: SortSpec[];
  };
}

/**
 * Resource identifier (JSON:API format)
 */
export interface ResourceIdentifier {
  id: string;
  type: string;
}

/**
 * Resource object with attributes (JSON:API format)
 */
export interface ResourceObject<TAttributes = Record<string, unknown>> {
  id: string;
  type: string;
  attributes: TAttributes;
  relationships?: Record<string, Relationship>;
  links?: {
    self?: string;
  };
}

/**
 * Relationship object (JSON:API format)
 */
export interface Relationship {
  data?: ResourceIdentifier | ResourceIdentifier[];
  links?: {
    self?: string;
    related?: string;
  };
  meta?: Record<string, unknown>;
}

/**
 * Response links (JSON:API format)
 */
export interface ResponseLinks {
  self?: string;
  first?: string;
  last?: string;
  prev?: string | null;
  next?: string | null;
  related?: string;
  [key: string]: string | null | undefined;
}

/**
 * Pagination metadata (JSON:API format)
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Response metadata (JSON:API format)
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
 * Error source (JSON:API format)
 */
export interface ErrorSource {
  pointer?: string;
  parameter?: string;
  header?: string;
}

/**
 * Error object (JSON:API format)
 */
export interface ErrorObject {
  id?: string;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: ErrorSource;
  meta?: Record<string, unknown>;
}

/**
 * Success Response - Single Resource (GET/POST/PUT)
 * JSON:API compliant response for single resource
 */
export interface SuccessResponse<TAttributes = Record<string, unknown>> {
  data: ResourceObject<TAttributes>;
  links?: ResponseLinks;
  meta?: ResponseMeta;
  included?: ResourceObject[];
}

/**
 * Paginated Response - Collection (GET Collection)
 * JSON:API compliant response for resource collections
 */
export interface PaginatedResponse<TAttributes = Record<string, unknown>> {
  data: ResourceObject<TAttributes>[];
  links?: ResponseLinks;
  meta?: ResponseMeta;
  included?: ResourceObject[];
}

/**
 * Error Response (JSON:API format)
 */
export interface ErrorResponse {
  errors: ErrorObject[];
  links?: ResponseLinks;
  meta?: ResponseMeta;
}

/**
 * Query builder options
 */
export interface QueryBuilderOptions {
  maxLimit?: number;
  defaultLimit?: number;
  allowedFields?: string[];
  allowedSortFields?: string[];
  allowedFilterFields?: string[];
  defaultSort?: SortSpec[];
}

/**
 * Response options for JSON:API responses
 */
export interface JsonApiResponseOptions {
  version?: string;
  message?: string;
  requestId?: string;
  includeTimestamp?: boolean;
  customMeta?: Record<string, unknown>;
}

/**
 * Paginated response options (extends JsonApiResponseOptions)
 */
export interface PaginatedResponseOptions extends JsonApiResponseOptions {
  includeCount?: boolean;
  includeLinks?: boolean;
}

/**
 * Success response options (extends JsonApiResponseOptions)
 */
export interface SuccessResponseOptions extends JsonApiResponseOptions {
  includeRelationships?: boolean;
  includeIncluded?: boolean;
}
