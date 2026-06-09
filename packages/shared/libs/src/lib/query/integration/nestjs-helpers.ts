/**
 * NestJS Integration Helpers
 *
 * Utilities specifically for NestJS integration
 *
 * @module NestJSHelpers
 */

import { Query } from '@nestjs/common';
import express from 'express';
import { QueryParams as QueryParamsType } from '../core/types.js';
import { IBaseQueryDto, IAdvancedQueryDto } from '../helpers/dto.js';
import {
  createQueryParamsFromObject,
  validateQueryParams,
} from './integration.js';
import { createBaseUrl, createSelfLink } from '../core/utils.js';

/**
 * Decorator for extracting and normalizing query parameters
 *
 * Note: This is an alias for NestJS @Query() decorator.
 * Use it when you want to extract query parameters.
 *
 * @example
 * ```typescript
 * @Get()
 * async findAll(@QueryParamsDecorator() params: Record<string, unknown>) {
 *   const queryParams = transformNestJSQuery(params);
 *   // Use queryParams...
 * }
 * ```
 */
export function QueryParamsDecorator() {
  return Query();
}

/**
 * @deprecated Use QueryParamsDecorator() instead to avoid naming conflict
 * This will be removed in future versions
 *
 * Note: Not exported to avoid conflict with QueryParams interface from core/types
 */
// export const QueryParams = QueryParamsDecorator; // Removed to avoid naming conflict

/**
 * Transform NestJS query object to QueryParams
 */
export function transformNestJSQuery(
  query: Record<string, unknown>
): QueryParamsType {
  return createQueryParamsFromObject(query);
}

/**
 * Create a validated query params from NestJS query
 */
export function createValidatedQueryParams(
  query: Record<string, unknown>,
  options: {
    maxLimit?: number;
    defaultLimit?: number;
    allowedSortFields?: string[];
    allowedFilterFields?: string[];
  } = {}
): QueryParamsType {
  const params = transformNestJSQuery(query);
  return validateQueryParams(params, options);
}

/**
 * Helper to extend base DTO with query params
 */
export function extendBaseQueryDto<T extends Record<string, unknown>>(
  baseDto: IBaseQueryDto,
  additionalFields: T
): IBaseQueryDto & T {
  return {
    ...baseDto,
    ...additionalFields,
  };
}

/**
 * Helper to create advanced query DTO from base
 */
export function createAdvancedQueryDto(
  baseDto: IBaseQueryDto,
  additionalParams?: Partial<IAdvancedQueryDto>
): IAdvancedQueryDto {
  return {
    ...baseDto,
    ...additionalParams,
  };
}

/**
 * Type guard to check if object is QueryParams
 */
export function isQueryParams(obj: unknown): obj is QueryParamsType {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('filters' in obj ||
      'simpleFilters' in obj ||
      'sort' in obj ||
      'sortBy' in obj ||
      'pagination' in obj ||
      'limit' in obj ||
      'offset' in obj)
  );
}

/**
 * Create base URL from Express Request object
 * Convenience wrapper for createBaseUrl from utils
 */
export function getBaseUrlFromRequest(req: express.Request): string {
  return createBaseUrl(req);
}

/**
 * Create self link for a resource from Express Request
 */
export function getSelfLinkFromRequest(
  req: express.Request,
  resourceId: string | number
): string {
  const baseUrl = getBaseUrlFromRequest(req);
  return createSelfLink(baseUrl, resourceId);
}
