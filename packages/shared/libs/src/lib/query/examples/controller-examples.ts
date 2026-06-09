/**
 * Controller Response Formatting Examples
 *
 * Examples showing how to format responses in NestJS controllers
 *
 * @module ControllerExamples
 */

/**
 * Example 1: Simple paginated response (JSON:API format)
 *
 * @example
 * ```typescript
 * import {
 *   executePrismaQuery,
 *   convertPaginatedResultToJsonApi
 * } from '@sparknexused/libs';
 *
 * @Get()
 * async getUserSets(
 *   @Query() query: any,
 *   @Req() req: Request
 * ) {
 *   const params = createQueryParamsFromObject(query);
 *   const result = await executePrismaQuery(
 *     this.prisma.vocabularySet,
 *     params,
 *     { includeCount: true }
 *   );
 *
 *   const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
 *   return convertPaginatedResultToJsonApi(
 *     result,
 *     'vocabulary-set',
 *     baseUrl,
 *     { message: 'Sets retrieved successfully', version: '1.0.0' }
 *   );
 * }
 * ```
 */

/**
 * Example 2: Paginated response with links (JSON:API format)
 * Note: Links are automatically included in JSON:API format
 *
 * @example
 * ```typescript
 * import {
 *   executePrismaQuery,
 *   convertPaginatedResultToJsonApi
 * } from '@sparknexused/libs';
 *
 * @Get()
 * async getUserSets(
 *   @Query() query: any,
 *   @Req() req: Request
 * ) {
 *   const params = createQueryParamsFromObject(query);
 *   const result = await executePrismaQuery(
 *     this.prisma.vocabularySet,
 *     params,
 *     { includeCount: true }
 *   );
 *
 *   const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
 *   return convertPaginatedResultToJsonApi(
 *     result,
 *     'vocabulary-set',
 *     baseUrl,
 *     { message: 'Sets retrieved successfully', version: '1.0.0' }
 *   );
 * }
 * ```
 */

/**
 * Example 3: Simple success response (JSON:API format)
 *
 * @example
 * ```typescript
 * import { convertEntityToJsonApi } from '@sparknexused/libs';
 *
 * @Get(':id')
 * async getSet(
 *   @Param('id') id: string,
 *   @Req() req: Request
 * ) {
 *   const set = await this.prisma.vocabularySet.findUnique({
 *     where: { id }
 *   });
 *
 *   const selfLink = `${req.protocol}://${req.get('host')}${req.path}`;
 *   return convertEntityToJsonApi(
 *     set,
 *     'vocabulary-set',
 *     {
 *       selfLink,
 *       message: 'Set retrieved successfully',
 *       version: '1.0.0'
 *     }
 *   );
 * }
 * ```
 */

/**
 * Example 4: Error response (JSON:API format)
 *
 * @example
 * ```typescript
 * import { formatErrorResponse, createErrorSource } from '@sparknexused/libs';
 * import { NotFoundException } from '@nestjs/common';
 *
 * @Get(':id')
 * async getSet(@Param('id') id: string) {
 *   const set = await this.prisma.vocabularySet.findUnique({
 *     where: { id }
 *   });
 *
 *   if (!set) {
 *     throw new NotFoundException(
 *       formatErrorResponse(
 *         [{
 *           status: '404',
 *           code: 'NOT_FOUND',
 *           title: 'Resource Not Found',
 *           detail: 'Set not found',
 *           source: createErrorSource(`/data/id`)
 *         }],
 *         { version: '1.0.0' }
 *       )
 *     );
 *   }
 *
 *   return convertEntityToJsonApi(set, 'vocabulary-set');
 * }
 * ```
 */

/**
 * Example 5: Response with metadata (JSON:API format)
 *
 * @example
 * ```typescript
 * import {
 *   convertPaginatedResultToJsonApi,
 *   executePrismaQuery
 * } from '@sparknexused/libs';
 *
 * @Get('stats')
 * async getStats(
 *   @Query() query: any,
 *   @Req() req: Request
 * ) {
 *   const params = createQueryParamsFromObject(query);
 *   const result = await executePrismaQuery(
 *     this.prisma.vocabularySet,
 *     params,
 *     { includeCount: true }
 *   );
 *
 *   const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
 *   return convertPaginatedResultToJsonApi(
 *     result,
 *     'vocabulary-set',
 *     baseUrl,
 *     {
 *       message: 'Statistics retrieved successfully',
 *       version: '1.0.0',
 *       meta: {
 *         totalSets: result.pagination.total,
 *         averageWords: 150,
 *         lastUpdated: new Date().toISOString(),
 *       }
 *     }
 *   );
 * }
 * ```
 */

/**
 * Example 6: Complete controller with all features
 *
 * @example
 * ```typescript
 * import { Controller, Get, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
 * import { Request } from 'express';
 * import {
 *   createQueryParamsFromObject,
 *   executePrismaQuery,
 *   convertPaginatedResultToJsonApi,
 *   convertEntityToJsonApi,
 *   formatErrorResponse,
 *   createErrorSource,
 *   validateQueryParams,
 *   createFilterBuilder,
 *   mergeQueryFilters,
 * } from '@sparknexused/libs';
 *
 * @Controller('packages')
 * export class VocabularySetController {
 *   constructor(private readonly prisma: PrismaService) {}
 *
 *   @Get()
 *   async getUserSets(
 *     @Query() query: any,
 *     @Req() req: Request,
 *     @CurrentUser() user: AuthUser
 *   ) {
 *     try {
 *       // Convert and validate
 *       const queryParams = validateQueryParams(
 *         createQueryParamsFromObject(query),
 *         {
 *           maxLimit: 100,
 *           defaultLimit: 20,
 *           allowedSortFields: ['createdAt', 'title', 'updatedAt'],
 *           allowedFilterFields: ['language', 'status', 'difficulty'],
 *         }
 *       );
 *
 *       // Add security filters
 *       const securityFilters = createFilterBuilder()
 *         .eq('userId', user.id)
 *         .eq('deleted', false)
 *         .build();
 *
 *       const finalParams = mergeQueryFilters(queryParams, securityFilters);
 *
 *       // Execute query
 *       const result = await executePrismaQuery(
 *         this.prisma.vocabularySet,
 *         finalParams,
 *         { includeCount: true, maxLimit: 100, defaultLimit: 20 }
 *       );
 *
 *       // Format response with links (JSON:API format)
 *       const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
 *       return convertPaginatedResultToJsonApi(
 *         result,
 *         'vocabulary-set',
 *         baseUrl,
 *         { message: 'Sets retrieved successfully', version: '1.0.0' }
 *       );
 *     } catch (error) {
 *       throw new HttpException(
 *         formatErrorResponse(
 *           [{
 *             status: '500',
 *             code: 'INTERNAL_SERVER_ERROR',
 *             title: 'Failed to retrieve sets',
 *             detail: error.message,
 *             source: createErrorSource('/query')
 *           }],
 *           { version: '1.0.0' }
 *         ),
 *         HttpStatus.INTERNAL_SERVER_ERROR
 *       );
 *     }
 *   }
 *
 *   @Get(':id')
 *   async getSet(
 *     @Param('id') id: string,
 *     @Req() req: Request,
 *     @CurrentUser() user: AuthUser
 *   ) {
 *     const set = await this.prisma.vocabularySet.findFirst({
 *       where: {
 *         id,
 *         userId: user.id,
 *         deleted: false,
 *       },
 *     });
 *
 *     if (!set) {
 *       throw new HttpException(
 *         formatErrorResponse(
 *           [{
 *             status: '404',
 *             code: 'NOT_FOUND',
 *             title: 'Resource Not Found',
 *             detail: 'Set not found',
 *             source: createErrorSource(`/data/id`)
 *           }],
 *           { version: '1.0.0' }
 *         ),
 *         HttpStatus.NOT_FOUND
 *       );
 *     }
 *
 *     const selfLink = `${req.protocol}://${req.get('host')}${req.path}`;
 *     return convertEntityToJsonApi(
 *       set,
 *       'vocabulary-set',
 *       { selfLink, message: 'Set retrieved successfully', version: '1.0.0' }
 *     );
 *   }
 * }
 * ```
 */

/**
 * Example 7: Using with Swagger/OpenAPI decorators
 *
 * @example
 * ```typescript
 * import { ApiResponse, ApiOperation } from '@nestjs/swagger';
 * import { PaginatedResponse } from '@sparknexused/libs';
 *
 * @Get()
 * @ApiOperation({ summary: 'Get user vocabulary sets' })
 * @ApiResponse({
 *   status: 200,
 *   description: 'Sets retrieved successfully',
 *   type: PaginatedResponse,
 * })
 * async getUserSets(
 *   @Query() query: any,
 *   @Req() req: Request
 * ) {
 *   const result = await executePrismaQuery(
 *     this.prisma.vocabularySet,
 *     createQueryParamsFromObject(query),
 *     { includeCount: true }
 *   );
 *
 *   const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
 *   return convertPaginatedResultToJsonApi(
 *     result,
 *     'vocabulary-set',
 *     baseUrl,
 *     { version: '1.0.0' }
 *   );
 * }
 * ```
 */

/**
 * Example 8: Custom response format
 *
 * @example
 * ```typescript
 * @Get()
 * async getUserSets(@Query() query: any) {
 *   const result = await executePrismaQuery(
 *     this.prisma.vocabularySet,
 *     createQueryParamsFromObject(query),
 *     { includeCount: true }
 *   );
 *
 *   // Custom format
 *   return {
 *     success: true,
 *     items: result.data,
 *     pagination: {
 *       total: result.pagination.total,
 *       page: result.pagination.page,
 *       pageSize: result.pagination.pageSize,
 *       totalPages: Math.ceil(
 *         (result.pagination.total || 0) / (result.pagination.pageSize || 20)
 *       ),
 *     },
 *     meta: result.metadata,
 *   };
 * }
 * ```
 */
