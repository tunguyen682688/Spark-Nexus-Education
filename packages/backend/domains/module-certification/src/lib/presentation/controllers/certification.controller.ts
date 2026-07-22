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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

import { GetCertificationDashboardQuery } from '../../application/queries/get-certification-dashboard.query';
import { GetFeaturedCollectionsQuery } from '../../application/queries/get-featured-collections.query';
import { GetTrendingCollectionsQuery } from '../../application/queries/get-trending-collections.query';
import { GetOfficialCollectionsQuery } from '../../application/queries/get-official-collections.query';
import { GetCommunityCollectionsQuery } from '../../application/queries/get-community-collections.query';
import { GetStudyPlanQuery } from '../../application/queries/get-study-plan.query';
import { GetTopContributorsQuery } from '../../application/queries/get-top-contributors.query';
import {
  GetCollectionQuery,
  GetExamQuery,
  GetExamSessionQuery,
  GetExamResultQuery,
} from '../../application/queries';

import { StartExamSessionDto } from '../../application/dtos/start-exam-session.dto';
import { SaveSessionAnswerDto } from '../../application/dtos/save-session-answer.dto';
import { RecordSessionViolationDto } from '../../application/dtos/record-session-violation.dto';

import { StartExamSessionCommand } from '../../application/commands/start-exam-session.command';
import { SaveSessionAnswerCommand } from '../../application/commands/save-session-answer.command';
import { RecordSessionViolationCommand } from '../../application/commands/record-session-violation.command';
import { SubmitExamSessionCommand } from '../../application/commands/submit-exam-session.command';

import { CertificationCacheService } from '../../infrastructure/cache/certification-cache.service';
import { CollectionEntity } from '../../domain/entities/collection.entity';

@ApiTags('Certification')
@Controller('certification')
export class CertificationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly cacheService: CertificationCacheService
  ) {}

  @Get('dashboard')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get certification dashboard statistics',
    description: 'Retrieves overall completion rates, streak metrics, XP earnings, and global leaderboard rankings.',
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
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
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

    const response = convertEntityToJsonApi(dashboardEntity, 'certification-dashboard', {
      selfLink: getSelfLinkFromRequest(req, 'dashboard'),
      message: 'Certification dashboard retrieved successfully',
      version: '1.0.0',
    });

    await this.cacheService.set(cacheKey, response, 300); // 5 mins cache
    return response;
  }

  @Get('collections/featured')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get featured exam collections',
    description: `
Retrieve paginated featured exam collections with query parameters support.

**Supported Parameters:**
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 10)
- \`exam\`: Filter by exam name
- \`search\`: Search keyword for title and description
`,
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Featured collections retrieved successfully',
    resourceType: 'certification-collection',
  })
  async getFeaturedCollections(
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const exam = typeof queryParams.exam === 'string' ? queryParams.exam : undefined;
    const search = typeof queryParams.search === 'string' ? queryParams.search : undefined;

    const cacheKey = `certification:collections:featured:${JSON.stringify(parsedParams)}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetFeaturedCollectionsQuery(exam, search, parsedParams)
    );

    const mappedItems = result.items.map((collection: CollectionEntity) => ({
      id: collection.id,
      title: collection.getTitle(),
      description: collection.getDescription() || '',
      ownerId: collection.getOwnerId(),
      publishStatus: collection.getPublishStatus(),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      examCount: collection.getExamCount(),
      itemCount: collection.getItemCount(),
      mocks: collection.getExamCount(),
      minis: collection.getItemCount(),
      questionsCount: collection.getExamCount() * 40,
    }));

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
    description: 'Retrieve paginated trending exam collections ordered by activity and creation date.',
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
    const cacheKey = `certification:collections:trending:${JSON.stringify(parsedParams)}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetTrendingCollectionsQuery(parsedParams)
    );

    const mappedItems = result.items.map((collection: CollectionEntity, index: number) => ({
      id: collection.id,
      rank: (result.page - 1) * result.limit + index + 1,
      title: collection.getTitle(),
      description: collection.getDescription() || '',
      ownerId: collection.getOwnerId(),
      publishStatus: collection.getPublishStatus(),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      examCount: collection.getExamCount(),
      itemCount: collection.getItemCount(),
      mocks: collection.getExamCount(),
      minis: collection.getItemCount(),
      questions: collection.getExamCount() * 40,
    }));

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
    const cacheKey = `certification:collections:official:${JSON.stringify(parsedParams)}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetOfficialCollectionsQuery(parsedParams)
    );

    const mappedItems = result.items.map((collection: CollectionEntity) => ({
      id: collection.id,
      title: collection.getTitle(),
      description: collection.getDescription() || '',
      ownerId: collection.getOwnerId(),
      publishStatus: collection.getPublishStatus(),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      examCount: collection.getExamCount(),
      itemCount: collection.getItemCount(),
      mocks: collection.getExamCount(),
      minis: collection.getItemCount(),
      questions: collection.getExamCount() * 40,
    }));

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
    description: 'Retrieve paginated community exam collections with filtering and search.',
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
    const cacheKey = `certification:collections:community:${JSON.stringify(parsedParams)}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(
      new GetCommunityCollectionsQuery(parsedParams)
    );

    const mappedItems = result.items.map((collection: CollectionEntity) => ({
      id: collection.id,
      title: collection.getTitle(),
      description: collection.getDescription() || '',
      ownerId: collection.getOwnerId(),
      publishStatus: collection.getPublishStatus(),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      examCount: collection.getExamCount(),
      itemCount: collection.getItemCount(),
      mocks: collection.getExamCount(),
      minis: collection.getItemCount(),
      questionsCount: collection.getExamCount() * 40,
    }));

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
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(new GetStudyPlanQuery(user.id));
    const response = convertEntityToJsonApi(result, 'certification-study-plan', {
      selfLink: getSelfLinkFromRequest(req, 'study-plan'),
      message: 'Study plan retrieved successfully',
      version: '1.0.0',
    });

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
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(new GetTopContributorsQuery());
    const response = convertEntityToJsonApi(result, 'certification-contributor', {
      selfLink: getSelfLinkFromRequest(req, 'contributors/top'),
      message: 'Top contributors retrieved successfully',
      version: '1.0.0',
    });

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
  async getCollection(
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:collections:${id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(new GetCollectionQuery(id));
    const response = convertEntityToJsonApi(result, 'certification-collection', {
      selfLink: getSelfLinkFromRequest(req, `collections/${id}`),
      message: 'Collection details retrieved successfully',
      version: '1.0.0',
    });

    await this.cacheService.set(cacheKey, response, 600); // 10 mins cache
    return response;
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
  async getExam(
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:exams:${id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
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
  })
  @ApiJsonApiSuccessResponse({
    description: 'Exam session retrieved successfully',
    resourceType: 'exam-session',
  })
  @ApiJsonApiErrorResponse({
    status: 404,
    description: 'Exam session not found',
  })
  async getSession(
    @Param('sessionId') sessionId: string,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(new GetExamSessionQuery(sessionId));
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
    summary: 'Get completed exam result scorecard with skill breakdown and AI feedback',
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
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.queryBus.execute(new GetExamResultQuery(resultId));
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
      selfLink: getSelfLinkFromRequest(req, `sessions/${sessionId}/answers/${result.id}`),
      message: 'Session answer saved successfully',
      version: '1.0.0',
    });
  }

  @Post('sessions/:sessionId/violations')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Record screen-switching or rule violation during the exam session',
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
      selfLink: getSelfLinkFromRequest(req, `sessions/${sessionId}/violations/${result.id}`),
      message: 'Session violation recorded successfully',
      version: '1.0.0',
    });
  }

  @Post('sessions/:sessionId/submit')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Submit and complete exam session, calculating score',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Exam session submitted and graded successfully',
    resourceType: 'exam-result',
  })
  async submitSession(
    @Param('sessionId') sessionId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new SubmitExamSessionCommand(sessionId)
    );

    return convertEntityToJsonApi(result, 'exam-result', {
      selfLink: getSelfLinkFromRequest(req, `results/${result.id}`),
      message: 'Exam session submitted and graded successfully',
      version: '1.0.0',
    });
  }
}
