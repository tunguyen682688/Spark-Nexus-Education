/**
 * Sort Builder
 *
 * Type-safe builder for constructing sort specifications
 *
 * @module SortBuilder
 */

import { SortSpec, SortDirection } from './types.js';

/**
 * Type-safe sort builder class
 */
export class SortBuilder {
  private sorts: SortSpec[] = [];

  /**
   * Create a new sort builder instance
   */
  static create(): SortBuilder {
    return new SortBuilder();
  }

  /**
   * Add ascending sort by field
   */
  asc(field: string, priority?: number): this {
    this.sorts.push({
      field,
      direction: SortDirection.ASC,
      priority: priority ?? this.sorts.length + 1,
    });
    return this;
  }

  /**
   * Add descending sort by field
   */
  desc(field: string, priority?: number): this {
    this.sorts.push({
      field,
      direction: SortDirection.DESC,
      priority: priority ?? this.sorts.length + 1,
    });
    return this;
  }

  /**
   * Add a custom sort specification
   */
  add(spec: SortSpec): this {
    this.sorts.push({
      ...spec,
      priority: spec.priority ?? this.sorts.length + 1,
    });
    return this;
  }

  /**
   * Build and return the sort specifications
   */
  build(): SortSpec[] {
    // Sort by priority if specified
    return this.sorts.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  }

  /**
   * Clear all sorts
   */
  clear(): this {
    this.sorts = [];
    return this;
  }
}

/**
 * Helper function to create a sort builder
 */
export function createSortBuilder(): SortBuilder {
  return SortBuilder.create();
}
