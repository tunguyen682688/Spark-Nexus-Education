/**
 * Utility Types and Helpers for JSON:API
 *
 * Type utilities and helper functions to make working with JSON:API easier
 *
 * @module JsonApiUtils
 */

import {
  SuccessResponse,
  PaginatedResponse,
  ErrorResponse,
  ResourceObject,
  PaginationMeta,
} from './types.js';

/**
 * Union type for all JSON:API response types
 */
export type JsonApiResponse<TAttributes = Record<string, unknown>> =
  | SuccessResponse<TAttributes>
  | PaginatedResponse<TAttributes>
  | ErrorResponse;

/**
 * Extract attributes type from a ResourceObject
 */
export type ExtractAttributes<T> = T extends ResourceObject<infer A>
  ? A
  : never;

/**
 * Extract attributes type from a SuccessResponse
 */
export type ExtractResponseAttributes<T> = T extends SuccessResponse<infer A>
  ? A
  : never;

/**
 * Extract attributes type from a PaginatedResponse
 */
export type ExtractPaginatedAttributes<T> = T extends PaginatedResponse<infer A>
  ? A
  : never;

/**
 * Type guard to check if response is SuccessResponse
 */
export function isSuccessResponse<TAttributes = Record<string, unknown>>(
  response: JsonApiResponse<TAttributes>
): response is SuccessResponse<TAttributes> {
  return (
    'data' in response &&
    !('errors' in response) &&
    !Array.isArray((response as SuccessResponse<TAttributes>).data)
  );
}

/**
 * Type guard to check if response is PaginatedResponse
 */
export function isPaginatedResponse<TAttributes = Record<string, unknown>>(
  response: JsonApiResponse<TAttributes>
): response is PaginatedResponse<TAttributes> {
  return (
    'data' in response &&
    !('errors' in response) &&
    Array.isArray((response as PaginatedResponse<TAttributes>).data)
  );
}

/**
 * Type guard to check if response is ErrorResponse
 */
export function isErrorResponse(
  response: JsonApiResponse
): response is ErrorResponse {
  return 'errors' in response;
}

/**
 * Calculate pagination metadata from offset and limit
 */
export function calculatePaginationMeta(
  offset: number,
  limit: number,
  total: number
): PaginationMeta {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
  };
}

/**
 * Calculate pagination metadata from page and pageSize
 */
export function calculatePaginationMetaFromPage(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);

  return {
    page,
    limit: pageSize,
    total,
    totalPages,
  };
}

/**
 * Create base URL from Express Request object
 */
export function createBaseUrl(req: {
  protocol: string;
  get: (header: string) => string | undefined;
  path: string;
}): string {
  return `${req.protocol}://${req.get('host')}${req.path}`;
}

/**
 * Create self link for a resource
 */
export function createSelfLink(
  baseUrl: string,
  resourceId: string | number
): string {
  return `${baseUrl}/${resourceId}`;
}

/**
 * Validate if object has required JSON:API structure
 */
export function isValidResourceObject(
  obj: unknown
): obj is ResourceObject<Record<string, unknown>> {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const resource = obj as Record<string, unknown>;
  return (
    typeof resource.id === 'string' &&
    typeof resource.type === 'string' &&
    typeof resource.attributes === 'object' &&
    resource.attributes !== null
  );
}

/**
 * Validate if object is a valid SuccessResponse
 */
export function isValidSuccessResponse(
  obj: unknown
): obj is SuccessResponse<Record<string, unknown>> {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const response = obj as Record<string, unknown>;
  if (!('data' in response)) {
    return false;
  }

  return isValidResourceObject(response.data);
}

/**
 * Validate if object is a valid PaginatedResponse
 */
export function isValidPaginatedResponse(
  obj: unknown
): obj is PaginatedResponse<Record<string, unknown>> {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const response = obj as Record<string, unknown>;
  if (!('data' in response) || !Array.isArray(response.data)) {
    return false;
  }

  return (response.data as unknown[]).every((item) =>
    isValidResourceObject(item)
  );
}

/**
 * Validate if object is a valid ErrorResponse
 */
export function isValidErrorResponse(obj: unknown): obj is ErrorResponse {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const response = obj as Record<string, unknown>;
  return (
    'errors' in response &&
    Array.isArray(response.errors) &&
    response.errors.length > 0
  );
}

/**
 * Extract resource type from a resource type string map
 * Useful for type-safe resource type handling
 */
export type ResourceTypeMap = Record<string, string>;

/**
 * Get resource type from entity type
 */
export function getResourceType(
  entityType: string,
  typeMap?: ResourceTypeMap
): string {
  return typeMap?.[entityType] || entityType;
}

/**
 * Create a type-safe resource type constant
 */
export function createResourceType<T extends string>(type: T): T {
  return type;
}

/**
 * Common resource types (can be extended)
 */
export const ResourceTypes = {
  VOCABULARY_SET: 'vocabulary-set',
  VOCABULARY_ENTRY: 'vocabulary-entry',
  USER: 'user',
  POST: 'post',
  COMMENT: 'comment',
} as const;

export type ResourceType = (typeof ResourceTypes)[keyof typeof ResourceTypes];
