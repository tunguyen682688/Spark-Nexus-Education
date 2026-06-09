/**
 * Query DTOs
 *
 * Base DTO classes/interfaces for query parameters
 *
 * Note: For validation decorators, install class-validator and class-transformer
 * and use them in your application code. These DTOs provide the base structure.
 *
 * @module QueryDTOs
 */

import {
  FilterCondition,
  SortSpec,
  PaginationConfig,
  SortDirection,
} from '../core/types.js';

/**
 * Base query DTO interface with common query parameters
 *
 * For NestJS usage with validation, extend this interface and add decorators:
 * @example
 * ```typescript
 * import { IsOptional, IsNumber, Min, Max } from 'class-validator';
 * import { Type } from 'class-transformer';
 *
 * export class BaseQueryDto implements IBaseQueryDto {
 *   @IsOptional()
 *   @IsNumber()
 *   @Min(1)
 *   @Max(100)
 *   @Type(() => Number)
 *   limit?: number = 20;
 *   // ... other fields
 * }
 * ```
 */
export interface IBaseQueryDto {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
  search?: string;
  searchFields?: string[];
}

/**
 * Advanced filter condition DTO interface
 *
 * This is the same as FilterCondition from types.
 * Use this alias for DTO purposes.
 */
export type FilterConditionDto = FilterCondition;

/**
 * Sort specification DTO interface
 *
 * This is the same as SortSpec from types.
 * Use this alias for DTO purposes.
 */
export type SortSpecDto = SortSpec;

/**
 * Advanced query DTO interface with full filtering, sorting, and pagination support
 *
 * For NestJS usage with validation, extend this interface and add decorators.
 * See IBaseQueryDto for example.
 */
export interface IAdvancedQueryDto extends IBaseQueryDto {
  filters?: FilterConditionDto[];
  sort?: SortSpecDto[];
  pagination?: PaginationConfig;
  cursor?: string;
  page?: number;
  pageSize?: number;
  include?: string[];
  exclude?: string[];
  relations?: string[];
  includeCount?: boolean;
  includeMetadata?: boolean;
}

/**
 * Pagination-only DTO interface
 */
export interface IPaginationDto {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
  cursor?: string;
}

/**
 * Search-only DTO interface
 */
export interface ISearchDto {
  q?: string;
  fields?: string[];
}

// Export type aliases for backward compatibility
export type BaseQueryDto = IBaseQueryDto;
export type AdvancedQueryDto = IAdvancedQueryDto;
export type PaginationDto = IPaginationDto;
export type SearchDto = ISearchDto;
