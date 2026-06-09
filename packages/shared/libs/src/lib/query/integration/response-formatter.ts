/**
 * Response Formatter
 *
 * Utilities for formatting API responses following JSON:API specification
 *
 * @module ResponseFormatter
 */

import {
  SuccessResponse,
  PaginatedResponse,
  ErrorResponse,
  ResourceObject,
  ResponseLinks,
  ResponseMeta,
  ErrorObject,
  ErrorSource,
  PaginationMeta,
  Relationship,
  ResourceIdentifier,
} from '../core/types.js';
import { calculatePaginationMeta } from '../core/utils.js';

/**
 * Format a success response for a single resource (GET/POST/PUT)
 * JSON:API compliant format
 *
 * @example
 * ```typescript
 * const response = formatSuccessResponse(
 *   { id: '123', name: 'John', email: 'john@example.com' },
 *   'user',
 *   '/api/v1/users/123',
 *   { message: 'User retrieved successfully', version: '1.0.0' }
 * );
 * ```
 */
export function formatSuccessResponse<TAttributes = Record<string, unknown>>(
  attributes: TAttributes,
  type: string,
  id: string | number,
  options?: {
    selfLink?: string;
    relationships?: Record<string, Relationship>;
    included?: ResourceObject[];
    meta?: Omit<ResponseMeta, 'timestamp'>;
    version?: string;
    message?: string;
  }
): SuccessResponse<TAttributes> {
  const response: SuccessResponse<TAttributes> = {
    data: {
      id: String(id),
      type,
      attributes,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(options?.version && { version: options.version }),
      ...(options?.message && { message: options.message }),
      ...(options?.meta && options.meta),
    },
  };

  if (options?.selfLink) {
    response.links = {
      self: options.selfLink,
    };
  }

  if (options?.relationships) {
    response.data.relationships = options.relationships;
  }

  if (options?.included && options.included.length > 0) {
    response.included = options.included;
  }

  return response;
}

/**
 * Format a paginated response for a collection (GET Collection)
 * JSON:API compliant format
 *
 * @example
 * ```typescript
 * const response = formatPaginatedResponse(
 *   [
 *     { id: '123', name: 'John', email: 'john@example.com' },
 *     { id: '124', name: 'Jane', email: 'jane@example.com' }
 *   ],
 *   'user',
 *   {
 *     page: 1,
 *     limit: 10,
 *     total: 50,
 *     totalPages: 5
 *   },
 *   '/api/v1/users',
 *   { version: '1.0.0' }
 * );
 * ```
 */
export function formatPaginatedResponse<TAttributes = Record<string, unknown>>(
  items: Array<{
    id: string | number;
    attributes: TAttributes;
    relationships?: Record<string, Relationship>;
  }>,
  type: string,
  pagination: PaginationMeta,
  baseUrl: string,
  options?: {
    included?: ResourceObject[];
    meta?: Omit<ResponseMeta, 'timestamp' | 'pagination'>;
    version?: string;
    message?: string;
  }
): PaginatedResponse<TAttributes> {
  const data: ResourceObject<TAttributes>[] = items.map((item) => ({
    id: String(item.id),
    type,
    attributes: item.attributes,
    ...(item.relationships && { relationships: item.relationships }),
  }));

  const links: ResponseLinks = {
    self: `${baseUrl}?page=${pagination.page}&limit=${pagination.limit}`,
    first: `${baseUrl}?page=1&limit=${pagination.limit}`,
    last: `${baseUrl}?page=${pagination.totalPages}&limit=${pagination.limit}`,
    prev:
      pagination.page > 1
        ? `${baseUrl}?page=${pagination.page - 1}&limit=${pagination.limit}`
        : null,
    next:
      pagination.page < pagination.totalPages
        ? `${baseUrl}?page=${pagination.page + 1}&limit=${pagination.limit}`
        : null,
  };

  const response: PaginatedResponse<TAttributes> = {
    data,
    links,
    meta: {
      timestamp: new Date().toISOString(),
      pagination,
      ...(options?.version && { version: options.version }),
      ...(options?.message && { message: options.message }),
      ...(options?.meta && options.meta),
    },
  };

  if (options?.included && options.included.length > 0) {
    response.included = options.included;
  }

  return response;
}

/**
 * Format an error response
 * JSON:API compliant format
 *
 * @example
 * ```typescript
 * const response = formatErrorResponse([
 *   {
 *     status: '400',
 *     code: 'VALIDATION_ERROR',
 *     title: 'Validation Failed',
 *     detail: 'Email is required',
 *     source: { pointer: '/data/attributes/email' },
 *     meta: { field: 'email', rule: 'required' }
 *   }
 * ], { version: '1.0.0', requestId: 'req-123' });
 * ```
 */
export function formatErrorResponse(
  errors: Array<{
    id?: string;
    status?: string;
    code?: string;
    title?: string;
    detail?: string;
    source?: ErrorSource;
    meta?: Record<string, unknown>;
  }>,
  options?: {
    links?: ResponseLinks;
    meta?: Omit<ResponseMeta, 'timestamp'>;
    version?: string;
    requestId?: string;
  }
): ErrorResponse {
  const errorObjects: ErrorObject[] = errors.map((error) => ({
    ...(error.id && { id: error.id }),
    ...(error.status && { status: error.status }),
    ...(error.code && { code: error.code }),
    ...(error.title && { title: error.title }),
    ...(error.detail && { detail: error.detail }),
    ...(error.source && { source: error.source }),
    ...(error.meta && { meta: error.meta }),
  }));

  const response: ErrorResponse = {
    errors: errorObjects,
    meta: {
      timestamp: new Date().toISOString(),
      ...(options?.version && { version: options.version }),
      ...(options?.requestId && { requestId: options.requestId }),
      ...(options?.meta && options.meta),
    },
  };

  if (options?.links) {
    response.links = options.links;
  }

  return response;
}

/**
 * Helper function to create a relationship object
 *
 * @example
 * ```typescript
 * const relationship = createRelationship(
 *   [{ id: '1', type: 'post' }, { id: '2', type: 'post' }],
 *   '/api/v1/users/123/posts'
 * );
 * ```
 */
export function createRelationship(
  data: ResourceIdentifier | ResourceIdentifier[],
  relatedLink?: string
): Relationship {
  const relationship: Relationship = {
    data: Array.isArray(data) ? data : data,
  };

  if (relatedLink) {
    relationship.links = {
      related: relatedLink,
    };
  }

  return relationship;
}

/**
 * Helper function to create pagination links for page-based pagination
 * Used internally by formatPaginatedResponse
 */
export function createJsonApiPaginationLinks(
  baseUrl: string,
  pagination: PaginationMeta
): ResponseLinks {
  const queryParams = new URLSearchParams({
    page: String(pagination.page),
    limit: String(pagination.limit),
  });

  return {
    self: `${baseUrl}?${queryParams.toString()}`,
    first: `${baseUrl}?page=1&limit=${pagination.limit}`,
    last: `${baseUrl}?page=${pagination.totalPages}&limit=${pagination.limit}`,
    prev:
      pagination.page > 1
        ? `${baseUrl}?page=${pagination.page - 1}&limit=${pagination.limit}`
        : null,
    next:
      pagination.page < pagination.totalPages
        ? `${baseUrl}?page=${pagination.page + 1}&limit=${pagination.limit}`
        : null,
  };
}

/**
 * Helper function to create an error source object
 *
 * @example
 * ```typescript
 * const source = createErrorSource('/data/attributes/email');
 * ```
 */
export function createErrorSource(
  pointer?: string,
  parameter?: string,
  header?: string
): ErrorSource {
  const source: ErrorSource = {};
  if (pointer) source.pointer = pointer;
  if (parameter) source.parameter = parameter;
  if (header) source.header = header;
  return source;
}


/**
 * Helper function to convert entity to ResourceObject
 * Extracts id and type, puts rest in attributes
 */
export function entityToResourceObject<
  TEntity extends { id?: string | number }
>(
  entity: TEntity,
  type: string,
  options?: {
    idField?: string;
    excludeFromAttributes?: string[];
    relationships?: Record<string, Relationship>;
  }
): ResourceObject<Record<string, unknown>> {
  const idField = options?.idField || 'id';
  const entityRecord = entity as Record<string, unknown>;
  const id = String(entityRecord[idField] ?? entityRecord.id ?? '');
  if (!id) {
    throw new Error(`Entity must have an id field (tried: ${idField}, id)`);
  }
  const excludeFields = [
    'id',
    idField,
    ...(options?.excludeFromAttributes || []),
  ];

  // Extract attributes (all fields except id and excluded fields)
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entityRecord)) {
    if (!excludeFields.includes(key)) {
      attributes[key] = value;
    }
  }

  const resource: ResourceObject<Record<string, unknown>> = {
    id,
    type,
    attributes,
  };

  if (options?.relationships) {
    resource.relationships = options.relationships;
  }

  return resource;
}

/**
 * Create JSON:API PaginatedResponse directly from data array
 * This is the recommended way to create paginated responses
 *
 * @example
 * ```typescript
 * const response = createJsonApiPaginatedResponse(
 *   items,
 *   total,
 *   'vocabulary-set',
 *   baseUrl,
 *   { page: 1, limit: 20, total: 100, totalPages: 5 },
 *   { message: 'Items retrieved successfully', version: '1.0.0' }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Or use helper to calculate from offset/limit
 * const pagination = calculatePaginationMeta(offset, limit, total);
 * const response = createJsonApiPaginatedResponse(
 *   items,
 *   total,
 *   'vocabulary-set',
 *   baseUrl,
 *   pagination,
 *   { message: 'Items retrieved successfully', version: '1.0.0' }
 * );
 * ```
 */
export function createJsonApiPaginatedResponse<
  TEntity extends { id?: string | number }
>(
  items: TEntity[],
  total: number,
  type: string,
  baseUrl: string,
  pagination: PaginationMeta,
  options?: {
    idField?: string;
    excludeFromAttributes?: string[];
    relationshipsExtractor?: (entity: TEntity) => Record<string, Relationship>;
    included?: ResourceObject[];
    version?: string;
    message?: string;
  }
): PaginatedResponse {
  const resourceItems = items.map((item) => {
    const relationships = options?.relationshipsExtractor
      ? options.relationshipsExtractor(item)
      : undefined;

    const itemId = item.id ?? (item as Record<string, unknown>).id;
    if (!itemId) {
      throw new Error('Entity must have an id field');
    }
    return {
      id: String(itemId),
      attributes: entityToResourceObject(item, type, {
        idField: options?.idField,
        excludeFromAttributes: options?.excludeFromAttributes,
        relationships,
      }).attributes,
      ...(relationships && { relationships }),
    };
  });

  return formatPaginatedResponse(resourceItems, type, pagination, baseUrl, {
    included: options?.included,
    version: options?.version,
    message: options?.message,
  });
}


/**
 * Convert single entity to JSON:API SuccessResponse
 * Helper function for easy migration from old format
 */
export function convertEntityToJsonApi<
  TEntity extends { id?: string | number }
>(
  entity: TEntity,
  type: string,
  options?: {
    idField?: string;
    excludeFromAttributes?: string[];
    relationships?: Record<string, Relationship>;
    included?: ResourceObject[];
    selfLink?: string;
    version?: string;
    message?: string;
  }
): SuccessResponse {
  const resourceObject = entityToResourceObject(entity, type, {
    idField: options?.idField,
    excludeFromAttributes: options?.excludeFromAttributes,
    relationships: options?.relationships,
  });

  return formatSuccessResponse(
    resourceObject.attributes,
    type,
    resourceObject.id,
    {
      selfLink: options?.selfLink,
      relationships: options?.relationships,
      included: options?.included,
      version: options?.version,
      message: options?.message,
    }
  );
}

/**
 * Create JSON:API PaginatedResponse from offset/limit (convenience function)
 * Automatically calculates page and totalPages from offset/limit
 *
 * @example
 * ```typescript
 * const response = createJsonApiPaginatedResponseFromOffset(
 *   items,
 *   total,
 *   'vocabulary-set',
 *   baseUrl,
 *   offset,
 *   limit,
 *   { message: 'Items retrieved successfully', version: '1.0.0' }
 * );
 * ```
 */
export function createJsonApiPaginatedResponseFromOffset<
  TEntity extends { id?: string | number }
>(
  items: TEntity[],
  total: number,
  type: string,
  baseUrl: string,
  offset: number,
  limit: number,
  options?: {
    idField?: string;
    excludeFromAttributes?: string[];
    relationshipsExtractor?: (entity: TEntity) => Record<string, Relationship>;
    included?: ResourceObject[];
    version?: string;
    message?: string;
  }
): PaginatedResponse {
  const pagination = calculatePaginationMeta(offset, limit, total);
  return createJsonApiPaginatedResponse(
    items,
    total,
    type,
    baseUrl,
    pagination,
    options
  );
}
