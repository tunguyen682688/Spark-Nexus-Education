/**
 * Pagination Builder
 *
 * Type-safe builder for constructing pagination configurations
 *
 * @module PaginationBuilder
 */

import {
  PaginationConfig,
  PaginationMode,
  OffsetPagination,
  PagePagination,
} from './types.js';

/**
 * Type-safe pagination builder class
 */
export class PaginationBuilder {
  private config: PaginationConfig | null = null;

  /**
   * Create a new pagination builder instance
   */
  static create(): PaginationBuilder {
    return new PaginationBuilder();
  }

  /**
   * Set offset-based pagination
   */
  offset(limit: number, offset: number): this {
    this.config = {
      mode: PaginationMode.OFFSET,
      config: { limit, offset },
    };
    return this;
  }

  /**
   * Set cursor-based pagination
   */
  cursor(
    limit: number,
    cursor?: string,
    direction: 'forward' | 'backward' = 'forward'
  ): this {
    this.config = {
      mode: PaginationMode.CURSOR,
      config: { limit, cursor, direction },
    };
    return this;
  }

  /**
   * Set page-based pagination
   */
  page(page: number, pageSize: number): this {
    this.config = {
      mode: PaginationMode.PAGE,
      config: { page, pageSize },
    };
    return this;
  }

  /**
   * Build and return the pagination configuration
   */
  build(): PaginationConfig | null {
    return this.config;
  }

  /**
   * Clear pagination configuration
   */
  clear(): this {
    this.config = null;
    return this;
  }
}

/**
 * Helper function to create a pagination builder
 */
export function createPaginationBuilder(): PaginationBuilder {
  return PaginationBuilder.create();
}

/**
 * Helper functions for common pagination patterns
 */
export const PaginationHelpers = {
  /**
   * Create offset pagination from simple limit/offset
   */
  fromOffset(limit: number, offset = 0): PaginationConfig {
    return {
      mode: PaginationMode.OFFSET,
      config: { limit, offset },
    };
  },

  /**
   * Create cursor pagination from simple limit/cursor
   */
  fromCursor(limit: number, cursor?: string): PaginationConfig {
    return {
      mode: PaginationMode.CURSOR,
      config: { limit, cursor, direction: 'forward' },
    };
  },

  /**
   * Create page pagination from simple page/pageSize
   */
  fromPage(page: number, pageSize: number): PaginationConfig {
    return {
      mode: PaginationMode.PAGE,
      config: { page, pageSize },
    };
  },

  /**
   * Convert page-based to offset-based
   */
  pageToOffset(page: number, pageSize: number): OffsetPagination {
    return {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };
  },

  /**
   * Convert offset-based to page-based
   */
  offsetToPage(limit: number, offset: number): PagePagination {
    return {
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    };
  },
};
