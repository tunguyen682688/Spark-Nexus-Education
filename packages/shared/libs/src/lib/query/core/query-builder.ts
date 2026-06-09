/**
 * Query Builder
 *
 * Comprehensive query builder that combines filtering, sorting, and pagination
 *
 * @module QueryBuilder
 */

import {
  QueryParams,
  FilterCondition,
  SortSpec,
  PaginationConfig,
  FieldSelection,
  QueryMetadata,
  QueryBuilderOptions,
} from './types.js';
import { FilterBuilder } from './filter-builder.js';
import { SortBuilder } from './sort-builder.js';
import { PaginationBuilder } from './pagination-builder.js';

/**
 * Main query builder class
 */
export class QueryBuilder<
  TFilters extends Record<string, unknown> = Record<string, unknown>
> {
  private filters: FilterCondition[] = [];
  private simpleFilters: Partial<TFilters> = {};
  private sorts: SortSpec[] = [];
  private sortBy?: string;
  private sortDirection?: import('./types.js').SortDirection;
  private pagination?: PaginationConfig;
  private limit?: number;
  private offset?: number;
  private page?: number;
  private pageSize?: number;
  private cursor?: string;
  private fields?: FieldSelection;
  private search?: string;
  private searchFields?: string[];
  private metadata?: QueryMetadata;
  private options: QueryBuilderOptions;

  constructor(options: QueryBuilderOptions = {}) {
    this.options = {
      maxLimit: 100,
      defaultLimit: 20,
      ...options,
    };
  }

  /**
   * Create a new query builder instance
   */
  static create<
    TFilters extends Record<string, unknown> = Record<string, unknown>
  >(options?: QueryBuilderOptions): QueryBuilder<TFilters> {
    return new QueryBuilder<TFilters>(options);
  }

  /**
   * Get filter builder for advanced filtering
   */
  filter(): FilterBuilder {
    const builder = FilterBuilder.create();
    return builder;
  }

  /**
   * Add filter conditions
   */
  addFilters(conditions: FilterCondition[]): this {
    this.filters.push(...conditions);
    return this;
  }

  /**
   * Set simple filters (key-value pairs)
   */
  setSimpleFilters(filters: Partial<TFilters>): this {
    this.simpleFilters = { ...this.simpleFilters, ...filters };
    return this;
  }

  /**
   * Get sort builder for advanced sorting
   */
  sort(): SortBuilder {
    const builder = SortBuilder.create();
    return builder;
  }

  /**
   * Add sort specifications
   */
  addSorts(specs: SortSpec[]): this {
    this.sorts.push(...specs);
    return this;
  }

  /**
   * Set simple sort (single field)
   */
  setSortBy(
    field: string,
    direction?: import('./types.js').SortDirection
  ): this {
    this.sortBy = field;
    this.sortDirection = direction;
    return this;
  }

  /**
   * Get pagination builder
   */
  paginate(): PaginationBuilder {
    const builder = PaginationBuilder.create();
    return builder;
  }

  /**
   * Set pagination configuration
   */
  setPagination(config: PaginationConfig): this {
    this.pagination = config;
    return this;
  }

  /**
   * Set simple offset pagination
   */
  setOffset(limit: number, offset = 0): this {
    this.limit = Math.min(limit, this.options.maxLimit ?? 100);
    this.offset = offset;
    return this;
  }

  /**
   * Set simple page pagination
   */
  setPage(page: number, pageSize: number): this {
    this.page = page;
    this.pageSize = Math.min(pageSize, this.options.maxLimit ?? 100);
    return this;
  }

  /**
   * Set simple cursor pagination
   */
  setCursor(limit: number, cursor?: string): this {
    this.limit = Math.min(limit, this.options.maxLimit ?? 100);
    this.cursor = cursor;
    return this;
  }

  /**
   * Set field selection
   */
  setFields(fields: FieldSelection): this {
    this.fields = fields;
    return this;
  }

  /**
   * Set search query
   */
  setSearch(query: string, fields?: string[]): this {
    this.search = query;
    this.searchFields = fields;
    return this;
  }

  /**
   * Set query metadata
   */
  setMetadata(metadata: QueryMetadata): this {
    this.metadata = metadata;
    return this;
  }

  /**
   * Build and return the complete query parameters
   */
  build(): QueryParams<TFilters> {
    const params: QueryParams<TFilters> = {};

    // Filters
    if (this.filters.length > 0) {
      params.filters = this.filters;
    }
    if (Object.keys(this.simpleFilters).length > 0) {
      params.simpleFilters = this.simpleFilters;
    }

    // Sorting
    if (this.sorts.length > 0) {
      params.sort = this.sorts;
    }
    if (this.sortBy) {
      params.sortBy = this.sortBy;
      if (this.sortDirection) {
        params.sortDirection = this.sortDirection;
      }
    }

    // Pagination
    if (this.pagination) {
      params.pagination = this.pagination;
    }
    if (this.limit !== undefined) {
      params.limit = this.limit;
    }
    if (this.offset !== undefined) {
      params.offset = this.offset;
    }
    if (this.page !== undefined) {
      params.page = this.page;
    }
    if (this.pageSize !== undefined) {
      params.pageSize = this.pageSize;
    }
    if (this.cursor !== undefined) {
      params.cursor = this.cursor;
    }

    // Field selection
    if (this.fields) {
      params.fields = this.fields;
    }

    // Search
    if (this.search) {
      params.search = this.search;
      if (this.searchFields) {
        params.searchFields = this.searchFields;
      }
    }

    // Metadata
    if (this.metadata) {
      params.metadata = this.metadata;
    } else {
      params.metadata = {
        defaultLimit: this.options.defaultLimit,
        maxLimit: this.options.maxLimit,
      };
    }

    return params;
  }

  /**
   * Clear all query parameters
   */
  clear(): this {
    this.filters = [];
    this.simpleFilters = {};
    this.sorts = [];
    this.sortBy = undefined;
    this.sortDirection = undefined;
    this.pagination = undefined;
    this.limit = undefined;
    this.offset = undefined;
    this.page = undefined;
    this.pageSize = undefined;
    this.cursor = undefined;
    this.fields = undefined;
    this.search = undefined;
    this.searchFields = undefined;
    this.metadata = undefined;
    return this;
  }
}

/**
 * Helper function to create a query builder
 */
export function createQueryBuilder<
  TFilters extends Record<string, unknown> = Record<string, unknown>
>(options?: QueryBuilderOptions): QueryBuilder<TFilters> {
  return QueryBuilder.create<TFilters>(options);
}
