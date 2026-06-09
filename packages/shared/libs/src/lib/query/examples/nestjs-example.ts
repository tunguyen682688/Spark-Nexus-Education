/**
 * NestJS Integration Examples
 *
 * Real-world examples of using the query system in NestJS controllers and handlers
 *
 * @module NestJSExamples
 */

/**
 * Example 1: Simple migration from old DTO to new system
 */
export class ExampleController1 {
  // Old DTO (keep for backward compatibility)
  // export class ListVocabularySetsDto {
  //   limit?: number = 20;
  //   offset?: number = 0;
  //   language?: string;
  //   status?: string;
  // }
  // @Get()
  // async getUserSets(@Query() queryDto: ListVocabularySetsDto) {
  //   // Convert old DTO to new QueryParams
  //   const queryParams = createQueryParamsFromObject({
  //     ...queryDto,
  //     // Map domain-specific fields
  //     language: queryDto.language,
  //     status: queryDto.status,
  //   });
  //   // Add security filters (user can only see their own sets)
  //   const securityFilters = createFilterBuilder()
  //     .eq('userId', this.currentUser.id)
  //     .eq('deleted', false)
  //     .build();
  //   const finalParams = mergeQueryFilters(queryParams, securityFilters);
  //   // Build and execute
  //   const prismaQuery = buildPrismaQuery(finalParams, {
  //     maxLimit: 100,
  //     defaultLimit: 20,
  //   });
  //   const [sets, total] = await Promise.all([
  //     this.prisma.vocabularySet.findMany({
  //       ...prismaQuery,
  //       where: {
  //         ...prismaQuery.where,
  //         userId: this.currentUser.id,
  //       },
  //     }),
  //     this.prisma.vocabularySet.count({
  //       where: prismaQuery.where,
  //     }),
  //   ]);
  //   return createPaginatedResult(
  //     sets,
  //     total,
  //     extractPagination(finalParams)!
  //   );
  // }
}

/**
 * Example 2: Using executePrismaQuery helper
 */
export class ExampleController2 {
  // @Get()
  // async getUserSets(@Query() query: Record<string, unknown>) {
  //   // Convert and validate
  //   const queryParams = validateQueryParams(
  //     createQueryParamsFromObject(query),
  //     {
  //       maxLimit: 100,
  //       defaultLimit: 20,
  //       allowedSortFields: ['createdAt', 'title', 'updatedAt'],
  //       allowedFilterFields: ['language', 'status', 'difficulty'],
  //     }
  //   );
  //   // Add security filters
  //   const securityFilters = createFilterBuilder()
  //     .eq('userId', this.currentUser.id)
  //     .eq('deleted', false)
  //     .build();
  //   const finalParams = mergeQueryFilters(queryParams, securityFilters);
  //   // Execute with automatic pagination
  //   return executePrismaQuery(
  //     this.prisma.vocabularySet,
  //     finalParams,
  //     {
  //       includeCount: true,
  //       maxLimit: 100,
  //       defaultLimit: 20,
  //     }
  //   );
  // }
}

/**
 * Example 3: Advanced filtering with nested conditions
 */
export class ExampleController3 {
  // @Get('search')
  // async searchSets(@Query() query: Record<string, unknown>) {
  //   const queryParams = createQueryParamsFromObject(query);
  //   // Complex filters
  //   const filters = createFilterBuilder()
  //     .and([
  //       // Must be public or owned by user
  //       createFilterBuilder()
  //         .or([
  //           createFilterBuilder().eq('isPublic', true).build()[0],
  //           createFilterBuilder().eq('userId', this.currentUser.id).build()[0],
  //         ])
  //         .build()[0],
  //       // Not deleted
  //       createFilterBuilder().eq('deleted', false).build()[0],
  //     ])
  //     .build();
  //   const finalParams = mergeQueryFilters(queryParams, filters);
  //   return executePrismaQuery(
  //     this.prisma.vocabularySet,
  //     finalParams,
  //     { includeCount: true }
  //   );
  // }
}

/**
 * Example 4: Using with CQRS Query Handler
 */
export class ExampleQueryHandler {
  // @QueryHandler(GetVocabularySetsQuery)
  // export class GetVocabularySetsHandler
  //   implements IQueryHandler<GetVocabularySetsQuery>
  // {
  //   constructor(private readonly prisma: PrismaService) {}
  //   async execute(query: GetVocabularySetsQuery) {
  //     // Convert CQRS query to QueryParams
  //     const queryParams: QueryParams = {
  //       simpleFilters: {
  //         userId: query.userId,
  //         deleted: false,
  //       },
  //       limit: query.limit,
  //       offset: query.offset,
  //       sortBy: query.sortBy,
  //       sortDirection: query.sortDirection,
  //     };
  //     // Add domain-specific filters
  //     const domainFilters = createFilterBuilder();
  //     if (query.language) {
  //       domainFilters.eq('language', query.language);
  //     }
  //     if (query.difficulty) {
  //       domainFilters.eq('difficulty', query.difficulty);
  //     }
  //     if (query.tags && query.tags.length > 0) {
  //       domainFilters.in('tags', query.tags);
  //     }
  //     const finalParams = mergeQueryFilters(
  //       queryParams,
  //       domainFilters.build()
  //     );
  //     // Execute
  //     return executePrismaQuery(
  //       this.prisma.vocabularySet,
  //       finalParams,
  //       { includeCount: true }
  //     );
  //   }
  // }
}

/**
 * Example 5: Date range filtering
 */
export class ExampleController5 {
  // @Get('recent')
  // async getRecentSets(@Query() query: Record<string, unknown>) {
  //   const queryParams = createQueryParamsFromObject(query);
  //   // Date range filter
  //   const dateFilters = createFilterBuilder()
  //     .gte('createdAt', query.fromDate || '2024-01-01')
  //     .lte('createdAt', query.toDate || new Date().toISOString())
  //     .build();
  //   const finalParams = mergeQueryFilters(queryParams, dateFilters);
  //   return executePrismaQuery(
  //     this.prisma.vocabularySet,
  //     finalParams,
  //     { includeCount: false } // Don't need count for recent items
  //   );
  // }
}

/**
 * Example 6: Multi-field search
 */
export class ExampleController6 {
  // @Get('search')
  // async search(@Query() query: { q?: string; fields?: string[] }) {
  //   const queryParams: QueryParams = {
  //     search: query.q,
  //     searchFields: query.fields || ['title', 'description', 'tags'],
  //     limit: 20,
  //   };
  //   // Search creates OR conditions across fields
  //   // This is handled automatically by createSearchFilter
  //   return executePrismaQuery(
  //     this.prisma.vocabularySet,
  //     queryParams,
  //     { includeCount: true }
  //   );
  // }
}

/**
 * Example 7: Cursor-based pagination
 */
export class ExampleController7 {
  // @Get('feed')
  // async getFeed(@Query() query: { cursor?: string; limit?: number }) {
  //   const queryParams: QueryParams = {
  //     pagination: {
  //       mode: 'cursor',
  //       config: {
  //         limit: query.limit || 20,
  //         cursor: query.cursor,
  //         direction: 'forward',
  //       },
  //     },
  //   };
  //   const prismaQuery = buildPrismaQuery(queryParams);
  //   const items = await this.prisma.vocabularySet.findMany({
  //     ...prismaQuery,
  //     where: {
  //       ...prismaQuery.where,
  //       isPublic: true,
  //       deleted: false,
  //     },
  //   });
  //   // Get next cursor
  //   const nextCursor =
  //     items.length === queryParams.pagination.config.limit
  //       ? items[items.length - 1].id
  //       : undefined;
  //   return {
  //     data: items,
  //     pagination: {
  //       cursor: query.cursor,
  //       nextCursor,
  //       hasMore: nextCursor !== undefined,
  //     },
  //   };
  // }
}
