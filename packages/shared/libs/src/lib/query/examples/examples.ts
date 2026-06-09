/**
 * Query System Examples
 *
 * Examples demonstrating how to use the query parameter system
 *
 * @module QueryExamples
 */

import { SortDirection } from '../core/types.js';
import {
  createFilterBuilder,
  createSortBuilder,
  createPaginationBuilder,
  createQueryBuilder,
} from '../core/index.js';
import {
  normalizeQueryParams,
  extractFilters,
  extractSorts,
  extractPagination,
  createSearchFilter,
  mergeFilters,
} from '../helpers/helpers.js';
import {
  toPrismaWhere,
  toPrismaOrderBy,
  toPrismaPagination,
} from '../transformers/transformers.js';

/**
 * Example 1: Basic filtering
 */
export function exampleBasicFiltering() {
  const filters = createFilterBuilder()
    .eq('status', 'active')
    .gt('createdAt', '2024-01-01')
    .in('category', ['tech', 'science'])
    .build();

  console.log('Basic filters:', filters);
}

/**
 * Example 2: Advanced nested filtering
 */
export function exampleNestedFiltering() {
  const filters = createFilterBuilder()
    .and([
      createFilterBuilder().eq('status', 'active').build()[0],
      createFilterBuilder().gt('createdAt', '2024-01-01').build()[0],
    ])
    .or([
      createFilterBuilder().eq('category', 'tech').build()[0],
      createFilterBuilder().eq('category', 'science').build()[0],
    ])
    .build();

  console.log('Nested filters:', filters);
}

/**
 * Example 3: Multi-field sorting
 */
export function exampleMultiFieldSorting() {
  const sorts = createSortBuilder()
    .desc('createdAt', 1)
    .asc('title', 2)
    .desc('priority', 3)
    .build();

  console.log('Multi-field sorts:', sorts);
}

/**
 * Example 4: Different pagination modes
 */
export function examplePaginationModes() {
  // Offset-based
  const offsetPagination = createPaginationBuilder().offset(20, 0).build();

  // Cursor-based
  const cursorPagination = createPaginationBuilder()
    .cursor(20, 'cursor-id-123')
    .build();

  // Page-based
  const pagePagination = createPaginationBuilder().page(1, 20).build();

  console.log('Pagination modes:', {
    offset: offsetPagination,
    cursor: cursorPagination,
    page: pagePagination,
  });
}

/**
 * Example 5: Complete query builder
 */
export function exampleCompleteQuery() {
  const query = createQueryBuilder({
    maxLimit: 100,
    defaultLimit: 20,
  })
    .addFilters([
      createFilterBuilder().eq('status', 'active').build()[0],
      createFilterBuilder().gt('createdAt', '2024-01-01').build()[0],
    ])
    .addSorts([
      { field: 'createdAt', direction: SortDirection.DESC },
      { field: 'title', direction: SortDirection.ASC },
    ])
    .setOffset(20, 0)
    .setSearch('typescript', ['title', 'description'])
    .build();

  console.log('Complete query:', query);
}

/**
 * Example 6: Using with Prisma
 */
export function exampleWithPrisma() {
  const filters = createFilterBuilder()
    .eq('status', 'active')
    .gt('createdAt', '2024-01-01')
    .build();

  const sorts = createSortBuilder().desc('createdAt').build();

  const pagination = createPaginationBuilder().offset(20, 0).build();

  // Transform to Prisma format
  const where = toPrismaWhere(filters);
  const orderBy = toPrismaOrderBy(sorts);
  const paginationParams = pagination ? toPrismaPagination(pagination) : {};

  console.log('Prisma query:', {
    where,
    orderBy,
    ...paginationParams,
  });

  // Usage in Prisma:
  // const results = await prisma.vocabularySet.findMany({
  //   where,
  //   orderBy,
  //   ...paginationParams,
  // });
}

/**
 * Example 7: Normalizing simple query params
 */
export function exampleNormalizeQuery() {
  const simpleParams = {
    limit: 20,
    offset: 0,
    sortBy: 'createdAt',
    sortDirection: SortDirection.DESC,
    simpleFilters: {
      status: 'active',
      category: 'tech',
    },
  };

  const normalized = normalizeQueryParams(simpleParams);
  console.log('Normalized query:', normalized);
}

/**
 * Example 8: Search with multiple fields
 */
export function exampleSearch() {
  const searchFilters = createSearchFilter('typescript', [
    'title',
    'description',
    'tags',
  ]);

  console.log('Search filters:', searchFilters);
}

/**
 * Example 9: Merging multiple filter sets
 */
export function exampleMergeFilters() {
  const filters1 = createFilterBuilder().eq('status', 'active').build();

  const filters2 = createFilterBuilder().gt('createdAt', '2024-01-01').build();

  const filters3 = createSearchFilter('typescript', ['title']);

  const merged = mergeFilters(filters1, filters2, filters3);
  console.log('Merged filters:', merged);
}

/**
 * Example 10: Extracting query components
 */
export function exampleExtractComponents() {
  const paginationConfig = createPaginationBuilder().offset(20, 0).build();
  const query = {
    filters: createFilterBuilder().eq('status', 'active').build(),
    sort: createSortBuilder().desc('createdAt').build(),
    pagination: paginationConfig ?? undefined,
  };

  const filters = extractFilters(query);
  const sorts = extractSorts(query);
  const pagination = extractPagination(query);

  console.log('Extracted components:', {
    filters,
    sorts,
    pagination,
  });
}
