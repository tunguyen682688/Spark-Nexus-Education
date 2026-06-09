/**
 * Swagger Decorators
 *
 * Decorators for generating Swagger documentation for query parameters and JSON:API responses
 *
 * @module SwaggerDecorators
 */
import { applyDecorators } from '@nestjs/common';
import {
  ApiQuery,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

export interface OffsetPaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
  defaultOffset?: number;
}

export function ApiOffsetPaginationQueries(
  options?: OffsetPaginationOptions
): MethodDecorator {
  const defaultLimit = options?.defaultLimit ?? 20;
  const maxLimit = options?.maxLimit ?? 200;
  const defaultOffset = options?.defaultOffset ?? 0;

  return applyDecorators(
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: `Items per page (default: ${defaultLimit}, max: ${maxLimit})`,
      example: defaultLimit,
    }),
    ApiQuery({
      name: 'offset',
      required: false,
      type: Number,
      description: `Offset for pagination (default: ${defaultOffset})`,
      example: defaultOffset,
    })
  );
}

export function ApiOrderByQuery(
  allowed: string[],
  options?: { description?: string; example?: string }
): MethodDecorator {
  return applyDecorators(
    ApiQuery({
      name: 'orderBy',
      required: false,
      enum: allowed,
      description:
        options?.description ??
        `Order results by one of: ${allowed.join(', ')}`,
      example: options?.example ?? allowed[0],
    })
  );
}

export function ApiSearchQuery(options?: {
  paramName?: string;
  description?: string;
  example?: string;
  withFields?: boolean;
}): MethodDecorator {
  const name = options?.paramName ?? 'search';
  const decorators: MethodDecorator[] = [
    ApiQuery({
      name,
      required: false,
      type: String,
      description: options?.description ?? 'Free text search query',
      example: options?.example ?? 'english idioms',
    }),
  ];

  // Add searchFields if requested
  if (options?.withFields) {
    decorators.push(
      ApiQuery({
        name: 'searchFields',
        required: false,
        isArray: true,
        type: String,
        description:
          'Fields to search in (if not specified, searches all searchable fields). Example: searchFields=title&searchFields=description',
        example: ['title', 'description', 'tags'],
      })
    );
  }

  return applyDecorators(...decorators);
}

export function ApiSortByQuery(options?: {
  description?: string;
  example?: string;
  enum?: string[];
}): MethodDecorator {
  return applyDecorators(
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      ...(options?.enum && { enum: options.enum }),
      description:
        options?.description ??
        'Sort by field, optionally with direction (e.g., "createdAt:desc")',
      example: options?.example ?? 'createdAt:desc',
    })
  );
}

/**
 * Decorator for enum query parameter
 */
export function ApiEnumQuery(options: {
  name: string;
  enum: string[] | Record<string, string>;
  description?: string;
  example?: string;
  required?: boolean;
}): MethodDecorator {
  const enumValues = Array.isArray(options.enum)
    ? options.enum
    : Object.values(options.enum);
  const example = options.example ?? enumValues[0];

  return ApiQuery({
    name: options.name,
    required: options.required ?? false,
    enum: enumValues,
    description: options.description ?? `One of: ${enumValues.join(', ')}`,
    example,
  });
}

/**
 * Decorator for boolean query parameter
 */
export function ApiBooleanQuery(options: {
  name: string;
  description?: string;
  example?: boolean;
  required?: boolean;
}): MethodDecorator {
  return ApiQuery({
    name: options.name,
    required: options.required ?? false,
    type: Boolean,
    description: options.description ?? 'Boolean flag',
    example: options.example ?? false,
  });
}

/**
 * Decorator for array query parameter
 */
export function ApiArrayQuery(options: {
  name: string;
  description?: string;
  example?: string[];
  itemType?: 'string' | 'number';
  required?: boolean;
}): MethodDecorator {
  return ApiQuery({
    name: options.name,
    required: options.required ?? false,
    isArray: true,
    type: options.itemType === 'number' ? Number : String,
    description: options.description ?? 'Array of values',
    example: options.example ?? [],
  });
}

// Cursor pagination (limit + cursor + direction)
export function ApiCursorPaginationQueries(options?: {
  defaultLimit?: number;
  defaultDirection?: 'forward' | 'backward';
}): MethodDecorator {
  const defaultLimit = options?.defaultLimit ?? 20;
  const defaultDirection = options?.defaultDirection ?? 'forward';
  return applyDecorators(
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: `Items per page (default: ${defaultLimit})`,
      example: defaultLimit,
    }),
    ApiQuery({
      name: 'cursor',
      required: false,
      type: String,
      description: 'Cursor token for pagination',
      example: 'eyJpZCI6IjEyMyJ9',
    }),
    ApiQuery({
      name: 'direction',
      required: false,
      enum: ['forward', 'backward'],
      description: `Cursor direction (default: ${defaultDirection})`,
      example: defaultDirection,
    })
  );
}

// Page pagination (page + pageSize)
export function ApiPagePaginationQueries(options?: {
  defaultPage?: number;
  defaultPageSize?: number;
  maxPageSize?: number;
}): MethodDecorator {
  const defaultPage = options?.defaultPage ?? 1;
  const defaultPageSize = options?.defaultPageSize ?? 20;
  const maxPageSize = options?.maxPageSize ?? 200;
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: `Page number (default: ${defaultPage})`,
      example: defaultPage,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: Number,
      description: `Page size (default: ${defaultPageSize}, max: ${maxPageSize})`,
      example: defaultPageSize,
    })
  );
}

// Multi-sort query: sort as CSV "field:direction:priority" or repeated entries
export function ApiSortQueries(options?: {
  example?: string | string[];
  description?: string;
}): MethodDecorator {
  const defaultExample = ['createdAt:desc:1', 'title:asc:2'];
  const example = options?.example
    ? Array.isArray(options.example)
      ? options.example
      : [options.example]
    : defaultExample;

  return applyDecorators(
    ApiQuery({
      name: 'sort',
      required: false,
      isArray: true,
      type: String,
      description:
        options?.description ??
        'Multi-field sorting. Format: "field:direction:priority" (direction: asc|desc, priority: number). Can repeat param or use CSV. Example: sort=createdAt:desc:1&sort=title:asc:2 or sort=createdAt:desc:1,title:asc:2',
      example,
    })
  );
}

// Filters: support deepObject JSON or simpleFilters (key=value)
export function ApiFiltersQuery(options?: {
  allowedFields?: string[];
  description?: string;
  example?: Record<string, unknown>;
}): MethodDecorator {
  const allowed = options?.allowedFields?.join(', ');
  const defaultExample = {
    conditions: [
      { field: 'language', operator: 'eq', value: 'en' },
      {
        field: 'difficulty',
        operator: 'in',
        value: ['intermediate', 'advanced'],
      },
      {
        operator: 'and',
        conditions: [
          { field: 'createdAt', operator: 'gte', value: '2024-01-01' },
          { field: 'status', operator: 'eq', value: 'published' },
        ],
      },
    ],
  };

  return applyDecorators(
    ApiQuery({
      name: 'filters',
      required: false,
      style: 'deepObject' as unknown as undefined,
      explode: true as unknown as undefined,
      description:
        options?.description ??
        `Advanced filters with operators (deepObject format). Supports: eq, ne, gt, gte, lt, lte, contains, in, between, and, or, not.${
          allowed ? ` Allowed fields: ${allowed}.` : ''
        } Example: filters[conditions][0][field]=language&filters[conditions][0][operator]=eq&filters[conditions][0][value]=en`,
      example: options?.example ?? defaultExample,
    }),
    ApiQuery({
      name: 'simpleFilters',
      required: false,
      style: 'deepObject' as unknown as undefined,
      explode: true as unknown as undefined,
      description:
        'Simple key-value filters (easier alternative). Example: simpleFilters[language]=en&simpleFilters[difficulty]=intermediate',
      example: { language: 'en', difficulty: 'intermediate' },
    })
  );
}

// Field selection: include/exclude/relations
export function ApiFieldsQuery(options?: {
  description?: string;
  includeExample?: string[];
  excludeExample?: string[];
  relationsExample?: string[];
}): MethodDecorator {
  return applyDecorators(
    ApiQuery({
      name: 'fields.include',
      required: false,
      isArray: true,
      type: String,
      description: options?.description ?? 'Whitelisted fields to include',
      example: options?.includeExample ?? ['id', 'title', 'language'],
    }),
    ApiQuery({
      name: 'fields.exclude',
      required: false,
      isArray: true,
      type: String,
      description: 'Fields to exclude',
      example: options?.excludeExample ?? ['internalNotes'],
    }),
    ApiQuery({
      name: 'fields.relations',
      required: false,
      isArray: true,
      type: String,
      description: 'Relations to include',
      example: options?.relationsExample ?? ['creator', 'items'],
    })
  );
}

// Metadata toggles for responses
export function ApiMetadataQueries(options?: {
  defaults?: { includeCount?: boolean; includeMetadata?: boolean };
}): MethodDecorator {
  const defaults = options?.defaults ?? {};
  return applyDecorators(
    ApiQuery({
      name: 'metadata.includeCount',
      required: false,
      type: Boolean,
      description: `Include total count in pagination (default: ${
        defaults.includeCount ?? false
      })`,
      example: defaults.includeCount ?? false,
    }),
    ApiQuery({
      name: 'metadata.includeMetadata',
      required: false,
      type: Boolean,
      description: `Include query metadata (default: ${
        defaults.includeMetadata ?? false
      })`,
      example: defaults.includeMetadata ?? false,
    })
  );
}

// Presets: compose common patterns
export function ApiListPreset(options?: {
  defaultLimit?: number;
  maxLimit?: number;
  defaultOffset?: number;
  orderByAllowed?: string[];
  withSearch?: boolean;
  withSort?: boolean;
  withFields?: boolean;
  withFilters?: boolean;
  withMetadata?: boolean;
}): MethodDecorator {
  const withOrderBy = (options?.orderByAllowed?.length ?? 0) > 0;
  return applyDecorators(
    ApiOffsetPaginationQueries({
      defaultLimit: options?.defaultLimit ?? 20,
      maxLimit: options?.maxLimit ?? 200,
      defaultOffset: options?.defaultOffset ?? 0,
    }),
    ...(withOrderBy && options?.orderByAllowed
      ? [ApiOrderByQuery(options.orderByAllowed)]
      : []),
    ...(options?.withSearch ? [ApiSearchQuery({ paramName: 'q' })] : []),
    ...(options?.withSort ? [ApiSortQueries()] : []),
    ...(options?.withFields ? [ApiFieldsQuery({})] : []),
    ...(options?.withFilters ? [ApiFiltersQuery({})] : []),
    ...(options?.withMetadata ? [ApiMetadataQueries({})] : [])
  );
}

export function ApiBrowsePreset(options?: {
  orderByAllowed?: string[];
}): MethodDecorator {
  return applyDecorators(
    ApiOffsetPaginationQueries({
      defaultLimit: 20,
      maxLimit: 200,
      defaultOffset: 0,
    }),
    ApiSearchQuery({ paramName: 'q' }),
    ...(options?.orderByAllowed?.length
      ? [ApiOrderByQuery(options.orderByAllowed)]
      : [])
  );
}

/**
 * JSON:API Response Schemas
 * Helper functions to create JSON:API compliant Swagger schemas
 */

/**
 * Create JSON:API Success Response Schema (single resource)
 */
export function createJsonApiSuccessResponseSchema(
  resourceType = 'resource',
  exampleId = '123'
): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          id: { type: 'string', example: exampleId },
          type: { type: 'string', example: resourceType },
          attributes: { type: 'object', additionalProperties: true },
          relationships: { type: 'object', additionalProperties: true },
        },
        required: ['id', 'type', 'attributes'],
      },
      links: {
        type: 'object',
        properties: {
          self: {
            type: 'string',
            example: `/api/v1/${resourceType}s/${exampleId}`,
          },
        },
      },
      meta: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          version: { type: 'string', example: '1.0.0' },
          message: { type: 'string', nullable: true },
        },
      },
      included: {
        type: 'array',
        items: { type: 'object', additionalProperties: true },
      },
    },
    required: ['data'],
  };
}

/**
 * Create JSON:API Paginated Response Schema (collection)
 */
export function createJsonApiPaginatedResponseSchema(
  resourceType = 'resource',
  exampleId = '123'
): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', example: exampleId },
            type: { type: 'string', example: resourceType },
            attributes: { type: 'object', additionalProperties: true },
            relationships: { type: 'object', additionalProperties: true },
          },
          required: ['id', 'type', 'attributes'],
        },
      },
      links: {
        type: 'object',
        properties: {
          self: {
            type: 'string',
            example: `/api/v1/${resourceType}s?page=1&limit=10`,
          },
          first: {
            type: 'string',
            example: `/api/v1/${resourceType}s?page=1&limit=10`,
          },
          last: {
            type: 'string',
            example: `/api/v1/${resourceType}s?page=5&limit=10`,
          },
          prev: { type: 'string', nullable: true, example: null },
          next: {
            type: 'string',
            nullable: true,
            example: `/api/v1/${resourceType}s?page=2&limit=10`,
          },
        },
      },
      meta: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          version: { type: 'string', example: '1.0.0' },
          message: { type: 'string', nullable: true },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number', example: 1 },
              limit: { type: 'number', example: 10 },
              total: { type: 'number', example: 50 },
              totalPages: { type: 'number', example: 5 },
            },
            required: ['page', 'limit', 'total', 'totalPages'],
          },
        },
      },
      included: {
        type: 'array',
        items: { type: 'object', additionalProperties: true },
      },
    },
    required: ['data'],
  };
}

/**
 * Create JSON:API Error Response Schema
 */
export function createJsonApiErrorResponseSchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'error-123' },
            status: { type: 'string', example: '400' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            title: { type: 'string', example: 'Validation Failed' },
            detail: { type: 'string', example: 'Email is required' },
            source: {
              type: 'object',
              properties: {
                pointer: { type: 'string', example: '/data/attributes/email' },
                parameter: { type: 'string', example: 'email' },
                header: { type: 'string', example: 'Authorization' },
              },
            },
            meta: { type: 'object', additionalProperties: true },
          },
        },
      },
      links: {
        type: 'object',
        properties: {
          self: { type: 'string', example: '/api/v1/resource' },
        },
      },
      meta: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          version: { type: 'string', example: '1.0.0' },
        },
      },
    },
    required: ['errors'],
  };
}

/**
 * Decorator for JSON:API Success Response (200 OK)
 */
export function ApiJsonApiSuccessResponse(options?: {
  description?: string;
  resourceType?: string;
  exampleId?: string;
}): MethodDecorator {
  const schema = createJsonApiSuccessResponseSchema(
    options?.resourceType,
    options?.exampleId
  );
  return ApiOkResponse({
    description:
      options?.description ?? 'Standardized JSON:API success response',
    schema,
  });
}

/**
 * Decorator for JSON:API Created Response (201 Created)
 */
export function ApiJsonApiCreatedResponse(options?: {
  description?: string;
  resourceType?: string;
  exampleId?: string;
}): MethodDecorator {
  const schema = createJsonApiSuccessResponseSchema(
    options?.resourceType,
    options?.exampleId
  );
  return ApiCreatedResponse({
    description:
      options?.description ?? 'Standardized JSON:API created response',
    schema,
  });
}

/**
 * Decorator for JSON:API Paginated Response (200 OK)
 */
export function ApiJsonApiPaginatedResponse(options?: {
  description?: string;
  resourceType?: string;
  exampleId?: string;
}): MethodDecorator {
  const schema = createJsonApiPaginatedResponseSchema(
    options?.resourceType,
    options?.exampleId
  );
  return ApiOkResponse({
    description:
      options?.description ?? 'Standardized JSON:API paginated response',
    schema,
  });
}

/**
 * Decorator for JSON:API Error Response
 */
export function ApiJsonApiErrorResponse(options?: {
  status?: number;
  description?: string;
}): MethodDecorator {
  const schema = createJsonApiErrorResponseSchema();
  const status = options?.status ?? 400;

  switch (status) {
    case 400:
      return ApiBadRequestResponse({
        description:
          options?.description ?? 'Bad Request - JSON:API error response',
        schema,
      });
    case 401:
      return ApiUnauthorizedResponse({
        description:
          options?.description ?? 'Unauthorized - JSON:API error response',
        schema,
      });
    case 403:
      return ApiForbiddenResponse({
        description:
          options?.description ?? 'Forbidden - JSON:API error response',
        schema,
      });
    case 404:
      return ApiNotFoundResponse({
        description:
          options?.description ?? 'Not Found - JSON:API error response',
        schema,
      });
    case 409:
      return ApiConflictResponse({
        description:
          options?.description ?? 'Conflict - JSON:API error response',
        schema,
      });
    default:
      return ApiResponse({
        status,
        description: options?.description ?? 'JSON:API error response',
        schema,
      });
  }
}

/**
 * Complete JSON:API response decorators preset
 * Includes success, error, and common HTTP status codes
 */
export function ApiJsonApiResponses(options?: {
  resourceType?: string;
  exampleId?: string;
  successDescription?: string;
  paginatedDescription?: string;
  includeCommonErrors?: boolean;
}): MethodDecorator {
  const decorators: MethodDecorator[] = [];

  // Success response (will be overridden by specific decorators)
  decorators.push(
    ApiJsonApiSuccessResponse({
      description: options?.successDescription,
      resourceType: options?.resourceType,
      exampleId: options?.exampleId,
    })
  );

  if (options?.includeCommonErrors) {
    decorators.push(
      ApiJsonApiErrorResponse({ status: 400, description: 'Bad Request' }),
      ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' }),
      ApiJsonApiErrorResponse({ status: 403, description: 'Forbidden' }),
      ApiJsonApiErrorResponse({ status: 404, description: 'Not Found' })
    );
  }

  return applyDecorators(...decorators);
}
