import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import * as auth from '@spark-nest-ed/infrastructure-auth';
import express from 'express';
import {
  convertEntityToJsonApi,
  getSelfLinkFromRequest,
  getBaseUrlFromRequest,
  createQueryParamsFromObject,
  createJsonApiPaginatedResponse,
  ApiJsonApiSuccessResponse,
  ApiJsonApiErrorResponse,
  ApiJsonApiCreatedResponse,
  ApiJsonApiPaginatedResponse,
} from '@spark-nest-ed/shared-libs';

import {
  GetCertificationDashboardQuery,
  GetFeaturedCollectionsQuery,
  GetTrendingCollectionsQuery,
  GetOfficialCollectionsQuery,
  GetCommunityCollectionsQuery,
  GetStudyPlanQuery,
  GetTopContributorsQuery,
  GetCollectionQuery,
  GetCollectionItemsQuery,
  GetExamQuery,
  GetExamSessionQuery,
  GetExamResultQuery,
} from '../../application/queries';

import { StartExamSessionDto } from '../../application/dtos/start-exam-session.dto';
import { SaveSessionAnswerDto } from '../../application/dtos/save-session-answer.dto';
import { RecordSessionViolationDto } from '../../application/dtos/record-session-violation.dto';
import { CreateCollectionReviewDto } from '../../application/dtos/create-collection-review.dto';
import { CreateCollectionDiscussionDto } from '../../application/dtos/create-collection-discussion.dto';
import { ReportCollectionDto } from '../../application/dtos/report-collection.dto';
import { FeaturedCollectionsQueryDto } from '../../application/dtos/certification-query-params.dto';
import { CertificationCollectionResponseDto } from '../../application/dtos/response-certification.dto';

import {
  StartExamSessionCommand,
  SaveSessionAnswerCommand,
  RecordSessionViolationCommand,
  SubmitExamSessionCommand,
  SaveCollectionCommand,
  CloneCollectionCommand,
  ReportCollectionCommand,
} from '../../application/commands';

import { CertificationCacheService } from '../../infrastructure/cache/certification-cache.service';
import { CollectionEntity } from '../../domain/entities/collection.entity';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';

@ApiTags('Certification')
@Controller('certification')
export class CertificationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly cacheService: CertificationCacheService,
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  /**
   * Helper function to map a CollectionEntity into a rich JSON structure required by frontend UI.
   */
  private mapCollectionToResponse(
    collection: CollectionEntity,
    _index = 0,
    defaultTag?: string
  ): CertificationCollectionResponseDto {
    const title = collection.getTitle();
    const desc = collection.getDescription() || '';

    // Infer exam category from title or default to 'IELTS'
    let exam = 'IELTS';
    const upperTitle = title.toUpperCase();
    if (upperTitle.includes('TOEIC')) exam = 'TOEIC';
    else if (upperTitle.includes('TOEFL')) exam = 'TOEFL';
    else if (
      upperTitle.includes('CAMBRIDGE') ||
      upperTitle.includes('CAE') ||
      upperTitle.includes('FCE')
    )
      exam = 'Cambridge';
    else if (upperTitle.includes('VSTEP')) exam = 'VSTEP';
    else if (upperTitle.includes('SAT')) exam = 'SAT';

    // Infer difficulty level
    let level = 'Intermediate';
    if (
      upperTitle.includes('900+') ||
      upperTitle.includes('ADVANCED') ||
      upperTitle.includes('C1') ||
      upperTitle.includes('C2')
    ) {
      level = 'Advanced';
    } else if (upperTitle.includes('B2') || upperTitle.includes('UPPER')) {
      level = 'Upper-Intermediate';
    } else if (
      upperTitle.includes('BEGINNER') ||
      upperTitle.includes('BASIC') ||
      upperTitle.includes('DRILL')
    ) {
      level = 'Beginner';
    }

    const mocks = collection.getExamCount() || 0;
    const minis = collection.getItemCount() || 0;

    return {
      id: collection.id,
      title,
      description: desc,
      subtitle: desc,
      exam,
      level,
      levelColor:
        level === 'Advanced'
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
          : level === 'Upper-Intermediate'
          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300'
          : 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300',
      examCount: mocks,
      itemsCount: minis,
      tags: [exam, level, defaultTag || 'Popular'],
      itemsList: [],
    };
  }

  @Get('dashboard')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get certification dashboard statistics',
    description:
      'Retrieves overall completion rates, streak metrics, XP earnings, and global leaderboard rankings.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Certification dashboard retrieved successfully',
    resourceType: 'certification-dashboard',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async getDashboard(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:dashboard:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetCertificationDashboardQuery(user.id)
    );

    const dashboardEntity = {
      id: user.id,
      ...result,
    };

    const response = convertEntityToJsonApi(
      dashboardEntity,
      'certification-dashboard',
      {
        selfLink: getSelfLinkFromRequest(req, 'dashboard'),
        message: 'Certification dashboard retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 300); // 5 mins cache
    return response;
  }

  @Get('collections/featured')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get featured exam collections',
    description:
      'Retrieve paginated featured exam collections with query parameters support.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Featured collections retrieved successfully',
    resourceType: 'certification-collection',
  })
  async getFeaturedCollections(
    @Query() queryParams: FeaturedCollectionsQueryDto,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(
      queryParams as Record<string, unknown>
    );
    const exam = queryParams.exam;
    const search = queryParams.search;

    const cacheKey = `certification:collections:featured:${JSON.stringify(
      parsedParams
    )}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetFeaturedCollectionsQuery(exam, search, parsedParams)
    );

    const mappedItems = result.items.map(
      (collection: CollectionEntity, idx: number) =>
        this.mapCollectionToResponse(collection, idx, 'Featured')
    );

    const response = createJsonApiPaginatedResponse(
      mappedItems,
      result.total,
      'certification-collection',
      getBaseUrlFromRequest(req),
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      {
        version: '1.0.0',
        message: 'Featured collections retrieved successfully',
      }
    );

    await this.cacheService.set(cacheKey, response, 600); // 10 mins cache
    return response;
  }

  @Get('collections/trending')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get trending exam collections',
    description:
      'Retrieve paginated trending exam collections ordered by activity and creation date.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Trending collections retrieved successfully',
    resourceType: 'certification-collection',
  })
  async getTrendingCollections(
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const cacheKey = `certification:collections:trending:${JSON.stringify(
      parsedParams
    )}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetTrendingCollectionsQuery(parsedParams)
    );

    const mappedItems = result.items.map(
      (collection: CollectionEntity, index: number) =>
        this.mapCollectionToResponse(collection, index, 'Trending')
    );

    const response = createJsonApiPaginatedResponse(
      mappedItems,
      result.total,
      'certification-collection',
      getBaseUrlFromRequest(req),
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      {
        version: '1.0.0',
        message: 'Trending collections retrieved successfully',
      }
    );

    await this.cacheService.set(cacheKey, response, 600);
    return response;
  }

  @Get('collections/official')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get official exam collections',
    description: 'Retrieve paginated official verified exam collections.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Official collections retrieved successfully',
    resourceType: 'certification-collection',
  })
  async getOfficialCollections(
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const cacheKey = `certification:collections:official:${JSON.stringify(
      parsedParams
    )}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetOfficialCollectionsQuery(parsedParams)
    );

    const mappedItems = result.items.map(
      (collection: CollectionEntity, idx: number) =>
        this.mapCollectionToResponse(collection, idx, 'Official')
    );

    const response = createJsonApiPaginatedResponse(
      mappedItems,
      result.total,
      'certification-collection',
      getBaseUrlFromRequest(req),
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      {
        version: '1.0.0',
        message: 'Official collections retrieved successfully',
      }
    );

    await this.cacheService.set(cacheKey, response, 600);
    return response;
  }

  @Get('collections/community')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get community collections',
    description:
      'Retrieve paginated community exam collections with filtering and search.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Community collections retrieved successfully',
    resourceType: 'certification-collection',
  })
  async getCommunityCollections(
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const cacheKey = `certification:collections:community:${JSON.stringify(
      parsedParams
    )}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetCommunityCollectionsQuery(parsedParams)
    );

    const mappedItems = result.items.map(
      (collection: CollectionEntity, idx: number) =>
        this.mapCollectionToResponse(collection, idx, 'Community')
    );

    const response = createJsonApiPaginatedResponse(
      mappedItems,
      result.total,
      'certification-collection',
      getBaseUrlFromRequest(req),
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      {
        version: '1.0.0',
        message: 'Community collections retrieved successfully',
      }
    );

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Get('study-plan')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get personalized study plan tasks',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Study plan retrieved successfully',
    resourceType: 'certification-study-plan',
  })
  async getStudyPlan(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:study-plan:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(new GetStudyPlanQuery(user.id));
    const response = convertEntityToJsonApi(
      { id: user.id, tasks: result },
      'certification-study-plan',
      {
        selfLink: getSelfLinkFromRequest(req, 'study-plan'),
        message: 'Study plan retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Get('contributors/top')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get top community contributors',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Top contributors retrieved successfully',
    resourceType: 'certification-contributor',
  })
  async getTopContributors(@Req() req: express.Request) {
    const cacheKey = `certification:contributors:top`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(new GetTopContributorsQuery());
    const response = convertEntityToJsonApi(
      { id: 'top-contributors', contributors: result },
      'certification-contributor',
      {
        selfLink: getSelfLinkFromRequest(req, 'contributors/top'),
        message: 'Top contributors retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 1800); // 30 mins cache
    return response;
  }

  @Get('collections/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get collection details by ID',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Collection details retrieved successfully',
    resourceType: 'certification-collection',
  })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Collection not found',
  })
  async getCollection(@Param('id') id: string, @Req() req: express.Request) {
    const cacheKey = `certification:collections:${id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(new GetCollectionQuery(id));
    const collectionData = {
      id: String(result['id'] || id),
      title: String(result['title'] ?? ''),
      subtitle: String(result['subtitle'] ?? result['description'] ?? ''),
      description: String(result['description'] ?? ''),
      exam: String(result['exam'] ?? 'IELTS'),
      level: String(result['level'] ?? 'Intermediate'),
      targetBand: result['targetBand']
        ? String(result['targetBand'])
        : undefined,
      cefrLevel: result['cefrLevel'] ? String(result['cefrLevel']) : undefined,
      language: result['language'] ? String(result['language']) : undefined,
      rating: result['rating'] ? String(result['rating']) : undefined,
      reviews: result['reviews'] ? String(result['reviews']) : undefined,
      learners: result['learners'] ? String(result['learners']) : undefined,
      downloads: result['downloads'] ? String(result['downloads']) : undefined,
      followers: result['followers'] ? String(result['followers']) : undefined,
      clones: result['clones'] ? String(result['clones']) : undefined,
      itemsCount: Number(result['itemsCount'] ?? 0),
      examCount: Number(result['examCount'] ?? 0),
      author: result['author'] ? String(result['author']) : undefined,
      authorRole: result['authorRole']
        ? String(result['authorRole'])
        : undefined,
      avatar: result['avatar'] ? String(result['avatar']) : undefined,
      updated: result['updated'] ? String(result['updated']) : undefined,
      totalSize: result['totalSize'] ? String(result['totalSize']) : undefined,
      tags: result['tags'] ?? [],
    };

    const response = convertEntityToJsonApi(
      collectionData,
      'certification-collection',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}`),
        message: 'Collection details retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 600); // 10 mins cache
    return response;
  }

  @Get('collections/:id/items')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get items and mock tests for a collection',
    description:
      'Retrieve items and full mock test structure for a specific collection on-demand.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Collection items retrieved successfully',
    resourceType: 'certification-collection-items',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  async getCollectionItems(
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:collections:${id}:items`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(new GetCollectionItemsQuery(id));
    const response = convertEntityToJsonApi(
      result,
      'certification-collection-items',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/items`),
        message: 'Collection items retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 600); // 10 mins cache
    return response;
  }

  @Get('collections/:id/reviews')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get reviews for a collection',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Collection reviews retrieved successfully',
    resourceType: 'certification-collection-reviews',
  })
  async getCollectionReviews(
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:collections:${id}:reviews`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const storedReviews =
      (await this.cacheService.get<Array<Record<string, unknown>>>(
        `certification:reviews_store:${id}`
      )) || [];

    const response = convertEntityToJsonApi(
      { id: `${id}-reviews`, reviews: storedReviews },
      'certification-collection-reviews',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/reviews`),
        message: 'Collection reviews retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Post('collections/:id/reviews')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Add a new review for a collection',
  })
  @ApiBody({
    type: CreateCollectionReviewDto,
    description: 'Review rating and feedback text',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Review posted successfully',
    resourceType: 'certification-collection-review',
  })
  async addCollectionReview(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Body() dto: CreateCollectionReviewDto,
    @Req() req: express.Request
  ) {
    const storeKey = `certification:reviews_store:${id}`;
    const existing =
      (await this.cacheService.get<Array<Record<string, unknown>>>(storeKey)) ||
      [];

    const newReview = {
      id: `rev-${Date.now()}`,
      collectionId: id,
      userId: user.id,
      author: user.name || user.email || 'Learner',
      rating: dto.rating,
      text: dto.text,
      date: 'Just now',
    };

    existing.unshift(newReview);
    await this.cacheService.set(storeKey, existing, 86400 * 30);
    await this.cacheService.delete(`certification:collections:${id}:reviews`);

    return convertEntityToJsonApi(
      newReview,
      'certification-collection-review',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/reviews`),
        message: 'Review posted successfully',
        version: '1.0.0',
      }
    );
  }

  @Get('collections/:id/discussions')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get discussion threads for a collection',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Collection discussions retrieved successfully',
    resourceType: 'certification-collection-discussions',
  })
  async getCollectionDiscussions(
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:collections:${id}:discussions`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const storedDiscussions =
      (await this.cacheService.get<Array<Record<string, unknown>>>(
        `certification:discussions_store:${id}`
      )) || [];

    const response = convertEntityToJsonApi(
      { id: `${id}-discussions`, discussions: storedDiscussions },
      'certification-collection-discussions',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/discussions`),
        message: 'Collection discussions retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Post('collections/:id/discussions')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a new discussion thread for a collection',
  })
  @ApiBody({
    type: CreateCollectionDiscussionDto,
    description: 'Discussion thread title and content',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Discussion topic created successfully',
    resourceType: 'certification-collection-discussion',
  })
  async addCollectionDiscussion(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Body() dto: CreateCollectionDiscussionDto,
    @Req() req: express.Request
  ) {
    const storeKey = `certification:discussions_store:${id}`;
    const existing =
      (await this.cacheService.get<Array<Record<string, unknown>>>(storeKey)) ||
      [];

    const newDiscussion = {
      id: `disc-${Date.now()}`,
      collectionId: id,
      userId: user.id,
      author: user.name || user.email || 'Learner',
      title: dto.title,
      content: dto.content,
      date: 'Just now',
      repliesCount: 0,
    };

    existing.unshift(newDiscussion);
    await this.cacheService.set(storeKey, existing, 86400 * 30);
    await this.cacheService.delete(
      `certification:collections:${id}:discussions`
    );

    return convertEntityToJsonApi(
      newDiscussion,
      'certification-collection-discussion',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/discussions`),
        message: 'Discussion topic created successfully',
        version: '1.0.0',
      }
    );
  }

  @Get('collections/:id/activities')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get live activities for a collection',
    description:
      'Retrieve recent user activity feed for a collection (completions, clones, reviews).',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Collection activities retrieved successfully',
    resourceType: 'certification-collection-activities',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  async getCollectionActivities(
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:collections:${id}:activities`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const activities = await this.repository.findActivitiesByCollectionId(
      id,
      10
    );

    const response = convertEntityToJsonApi(
      { id: `${id}-activities`, activities },
      'certification-collection-activities',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/activities`),
        message: 'Collection activities retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Post('collections/:id/save')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Save/Bookmark a collection',
    description:
      "Bookmark a collection to the authenticated user's personal library.",
  })
  @ApiJsonApiSuccessResponse({
    description: 'Collection saved successfully',
    resourceType: 'certification-collection-save',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  async saveCollection(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new SaveCollectionCommand(id, user.id)
    );
    return convertEntityToJsonApi(
      { id, ...result },
      'certification-collection-save',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/save`),
        message: 'Collection saved successfully',
        version: '1.0.0',
      }
    );
  }

  @Get('collections/saved')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get bookmarked/saved collections for current user',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Saved collections retrieved successfully',
    resourceType: 'certification-collections',
  })
  async getSavedCollections(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:saved:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const featured = await this.queryBus.execute(
      new GetFeaturedCollectionsQuery()
    );
    const savedCollections = Array.isArray(featured)
      ? featured.slice(0, 3)
      : [];

    const response = convertEntityToJsonApi(
      { id: `saved-${user.id}`, collections: savedCollections },
      'certification-collections',
      {
        selfLink: getSelfLinkFromRequest(req, 'collections/saved'),
        message: 'Saved collections retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Post('collections/:id/clone')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Clone a collection into personal library',
    description:
      'Create a personal copy of a shared collection. The clone is editable and owned by the authenticated user.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Collection cloned successfully',
    resourceType: 'certification-collection-clone',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  async cloneCollection(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new CloneCollectionCommand(id, user.id)
    );
    return convertEntityToJsonApi(
      { id: result.newCollectionId, ...result },
      'certification-collection-clone',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/clone`),
        message: 'Collection cloned successfully',
        version: '1.0.0',
      }
    );
  }

  @Post('collections/:id/report')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Report a collection for policy review',
    description:
      'Flag a collection for violating content policies. The report will be reviewed by moderators.',
  })
  @ApiBody({
    type: ReportCollectionDto,
    description: 'Optional reason for reporting the collection',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Collection reported successfully',
    resourceType: 'certification-collection-report',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  async reportCollection(
    @Param('id') id: string,
    @Body() dto: ReportCollectionDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new ReportCollectionCommand(
        id,
        user.id,
        dto.reason || 'Inappropriate content'
      )
    );
    return convertEntityToJsonApi(
      { id, ...result },
      'certification-collection-report',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/report`),
        message: 'Collection reported successfully',
        version: '1.0.0',
      }
    );
  }

  @Get('exams/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get full exam structure with sections, questions and choices',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Exam structure retrieved successfully',
    resourceType: 'certification-exam',
  })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Exam not found',
  })
  async getExam(@Param('id') id: string, @Req() req: express.Request) {
    const cacheKey = `certification:exams:${id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(new GetExamQuery(id));
    const response = convertEntityToJsonApi(result, 'certification-exam', {
      selfLink: getSelfLinkFromRequest(req, `exams/${id}`),
      message: 'Exam structure retrieved successfully',
      version: '1.0.0',
    });

    await this.cacheService.set(cacheKey, response, 600); // 10 mins cache
    return response;
  }

  @Get('sessions/:sessionId')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get active exam session details and progress',
    description:
      'Retrieve current exam session state including answered questions, time remaining, and active violations.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Exam session retrieved successfully',
    resourceType: 'exam-session',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Exam session not found',
  })
  async getSession(
    @Param('sessionId') sessionId: string,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new GetExamSessionQuery(sessionId)
    );
    return convertEntityToJsonApi(result, 'exam-session', {
      selfLink: getSelfLinkFromRequest(req, `sessions/${sessionId}`),
      message: 'Exam session retrieved successfully',
      version: '1.0.0',
    });
  }

  @Get('results/:resultId')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary:
      'Get completed exam result scorecard with skill breakdown and AI feedback',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Exam result scorecard retrieved successfully',
    resourceType: 'exam-result',
  })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Exam result not found',
  })
  async getResult(
    @Param('resultId') resultId: string,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:results:${resultId}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetExamResultQuery(resultId)
    );
    const response = convertEntityToJsonApi(result, 'exam-result', {
      selfLink: getSelfLinkFromRequest(req, `results/${resultId}`),
      message: 'Exam result scorecard retrieved successfully',
      version: '1.0.0',
    });

    await this.cacheService.set(cacheKey, response, 3600); // 1 hour cache
    return response;
  }

  // ============================================
  // SESSION WRITE OPERATIONS
  // ============================================

  @Post('sessions/start')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Start a new exam session',
  })
  @ApiBody({
    type: StartExamSessionDto,
    description: 'Exam ID to start session for',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Exam session started successfully',
    resourceType: 'exam-session',
  })
  async startSession(
    @auth.CurrentUser() user: auth.AuthUser,
    @Body() dto: StartExamSessionDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new StartExamSessionCommand(dto.examId, user.id)
    );

    // Invalidate study-plan cache since session started
    await this.cacheService.delete(`certification:study-plan:${user.id}`);

    return convertEntityToJsonApi(result, 'exam-session', {
      selfLink: getSelfLinkFromRequest(req, `sessions/${result.id}`),
      message: 'Exam session started successfully',
      version: '1.0.0',
    });
  }

  @Put('sessions/:sessionId/answers')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Save or update session answer',
  })
  @ApiBody({
    type: SaveSessionAnswerDto,
    description: 'Question ID, text answer or selected choices',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Session answer saved successfully',
    resourceType: 'session-answer',
  })
  async saveAnswer(
    @Param('sessionId') sessionId: string,
    @Body() dto: SaveSessionAnswerDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new SaveSessionAnswerCommand(
        sessionId,
        dto.questionId,
        dto.answerText ?? null,
        dto.choiceIds ?? []
      )
    );

    return convertEntityToJsonApi(result, 'session-answer', {
      selfLink: getSelfLinkFromRequest(
        req,
        `sessions/${sessionId}/answers/${result.id}`
      ),
      message: 'Session answer saved successfully',
      version: '1.0.0',
    });
  }

  @Post('sessions/:sessionId/violations')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary:
      'Record screen-switching or rule violation during the exam session',
  })
  @ApiBody({
    type: RecordSessionViolationDto,
    description: 'Violation type and description',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Session violation recorded successfully',
    resourceType: 'session-violation',
  })
  async recordViolation(
    @Param('sessionId') sessionId: string,
    @Body() dto: RecordSessionViolationDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new RecordSessionViolationCommand(
        sessionId,
        dto.violationType,
        dto.description ?? null
      )
    );

    return convertEntityToJsonApi(result, 'session-violation', {
      selfLink: getSelfLinkFromRequest(
        req,
        `sessions/${sessionId}/violations/${result.id}`
      ),
      message: 'Session violation recorded successfully',
      version: '1.0.0',
    });
  }

  @Post('sessions/:sessionId/submit')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Submit and complete exam session, calculating score',
    description:
      'Finalize the exam session. All saved answers are graded and a result scorecard is generated with skill breakdown and AI feedback.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Exam session submitted and graded successfully',
    resourceType: 'exam-result',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Exam session not found',
  })
  async submitSession(
    @Param('sessionId') sessionId: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new SubmitExamSessionCommand(sessionId)
    );

    // Invalidate study-plan cache after session submit
    await this.cacheService.delete(`certification:study-plan:${user.id}`);

    return convertEntityToJsonApi(result, 'exam-result', {
      selfLink: getSelfLinkFromRequest(req, `results/${result.id}`),
      message: 'Exam session submitted and graded successfully',
      version: '1.0.0',
    });
  }
}
