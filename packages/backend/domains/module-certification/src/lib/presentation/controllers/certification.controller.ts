import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
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
  GetCreatorDashboardQuery,
  GetCollectionEditorQuery,
  GetExamBuilderQuery,
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
  GetQuestionBuilderQuery,
  GetQuestionHistoryQuery,
  GetFavoritesQuery,
  GetBookmarksQuery,
  GetDownloadsQuery,
  GetPurchasedCollectionsQuery,
  GetCompletedCollectionsQuery,
  GetPracticeHistoryQuery,
  GetSavedCollectionsQuery,
  GetCollectionReviewsQuery,
  GetCollectionDiscussionsQuery,
  GetSectionQuestionsQuery,
  GetClonedCollectionsQuery,
  GetCollectionActivitiesQuery,
  GetInProgressSessionsQuery,
} from '../../application/queries';

import { StartExamSessionDto } from '../../application/dtos/start-exam-session.dto';
import { SaveSessionAnswerDto } from '../../application/dtos/save-session-answer.dto';
import { RecordSessionViolationDto } from '../../application/dtos/record-session-violation.dto';
import { CreateCollectionReviewDto } from '../../application/dtos/create-collection-review.dto';
import { CreateCollectionDiscussionDto } from '../../application/dtos/create-collection-discussion.dto';
import { ReportCollectionDto } from '../../application/dtos/report-collection.dto';
import { SaveQuestionDto } from '../../application/dtos/save-question.dto';
import { CreateCollectionDto } from '../../application/dtos/create-collection.dto';
import { UpdateCollectionDto } from '../../application/dtos/update-collection.dto';
import { CreateExamDto } from '../../application/dtos/create-exam.dto';
import { UpdateExamDto } from '../../application/dtos/update-exam.dto';
import { SaveExamSectionsDto } from '../../application/dtos/save-exam-sections.dto';
import { LinkQuestionToExamDto } from '../../application/dtos/link-question-to-exam.dto';
import { FeaturedCollectionsQueryDto, SectionQuestionsQueryDto } from '../../application/dtos/certification-query-params.dto';
import { CertificationCollectionResponseDto } from '../../application/dtos/response-certification.dto';
import { SyncChaptersDto } from '../../application/dtos/sync-chapters.dto';
import { AddBookmarkDto } from '../../application/dtos/add-bookmark.dto';

import {
  StartExamSessionCommand,
  SaveSessionAnswerCommand,
  RecordSessionViolationCommand,
  SubmitExamSessionCommand,
  CreateCollectionCommand,
  UpdateCollectionCommand,
  DeleteCollectionCommand,
  CreateExamCommand,
  UpdateExamCommand,
  DeleteExamCommand,
  SaveCollectionCommand,
  CloneCollectionCommand,
  SaveQuestionCommand,
  DeleteQuestionCommand,
  AddFavoriteCommand,
  RemoveFavoriteCommand,
  AddBookmarkCommand,
  RemoveBookmarkCommand,
  DeleteDownloadCommand,
  ClearDownloadsCommand,
  SaveReportCommand,
  AddCollectionReviewCommand,
  AddCollectionDiscussionCommand,
  SyncChaptersCommand,
  SaveExamSectionsCommand,
  LinkQuestionToExamCommand,
  UnlinkQuestionFromExamCommand,
} from '../../application/commands';

import { CertificationCacheService } from '../../infrastructure/cache/certification-cache.service';
import { CollectionEntity } from '../../domain/entities/collection.entity';

@ApiTags('Certification')
@Controller('certification')
export class CertificationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly cacheService: CertificationCacheService,
  ) {}

  /**
   * Helper function to map a CollectionEntity into a rich JSON structure required by frontend UI.
   */
  private mapCollectionToResponse(
    collection: CollectionEntity,
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
      ownerId: collection.getOwnerId(),
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

  @Get('creator-dashboard')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get creator dashboard analytics and performance metrics',
    description:
      'Retrieves total exams, questions, attempts, revenue, recent activity, and top performing exams for content creators.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Creator dashboard retrieved successfully',
    resourceType: 'creator-dashboard',
  })
  async getCreatorDashboard(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:creator-dashboard:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.queryBus.execute(new GetCreatorDashboardQuery(user.id));

    const response = convertEntityToJsonApi(
      data,
      'creator-dashboard',
      {
        selfLink: getSelfLinkFromRequest(req, 'creator-dashboard'),
        message: 'Creator dashboard retrieved successfully',
        version: '1.0.0',
      }
    );

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Get('collections/:id/editor')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get collection editor details and structure',
    description:
      'Retrieves editable collection chapters, exams list, settings, and summary metadata for creators.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Collection editor details retrieved successfully',
    resourceType: 'collection-editor',
  })
  async getCollectionEditor(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const data = await this.queryBus.execute(new GetCollectionEditorQuery(id, user.id));

    return convertEntityToJsonApi(data, 'collection-editor', {
      selfLink: getSelfLinkFromRequest(req, `collections/${id}/editor`),
      message: 'Collection editor details retrieved successfully',
      version: '1.0.0',
    });
  }

  @Get('exams/:id/builder')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get exam builder structure, sections, questions and settings',
    description:
      'Retrieves exam sections, questions list, blueprint totals, and settings for exam creation.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Exam builder details retrieved successfully',
    resourceType: 'exam-builder',
  })
  async getExamBuilder(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const data = await this.queryBus.execute(new GetExamBuilderQuery(id, user.id));

    return convertEntityToJsonApi(data, 'exam-builder', {
      selfLink: getSelfLinkFromRequest(req, `exams/${id}/builder`),
      message: 'Exam builder details retrieved successfully',
      version: '1.0.0',
    });
  }

  @Get('exams/:examId/sections/:sectionId/questions')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get questions for a specific section with pagination',
    description:
      'Retrieves questions linked to a section with pagination support. Used for lazy loading in exam builder.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Section questions retrieved successfully',
    resourceType: 'section-question',
  })
  async getSectionQuestions(
    @Param('examId') examId: string,
    @Param('sectionId') sectionId: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request,
    @Query() queryParams: SectionQuestionsQueryDto
  ) {
    const page = queryParams.page || 1;
    const pageSize = queryParams.pageSize || 10;

    const data = await this.queryBus.execute(
      new GetSectionQuestionsQuery(
        examId,
        sectionId,
        user.id,
        page,
        pageSize,
        queryParams.search
      )
    );

    return createJsonApiPaginatedResponse(
      data.questions,
      data.totalCount,
      'section-question',
      getBaseUrlFromRequest(req),
      {
        page: data.page,
        limit: data.pageSize,
        total: data.totalCount,
        totalPages: data.totalPages,
      },
      {
        version: '1.0.0',
        message: 'Section questions retrieved successfully',
      }
    );
  }

  @Get('questions/:id/builder')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get question builder details, options, explanation and quality score',
    description:
      'Retrieves question text, answer options, reference, explanation, properties, and live preview data.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Question builder details retrieved successfully',
    resourceType: 'question-builder',
  })
  async getQuestionBuilder(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new GetQuestionBuilderQuery(id)
    );

    return convertEntityToJsonApi(result, 'question-builder', {
      selfLink: getSelfLinkFromRequest(req, `questions/${id}/builder`),
      message: 'Question builder details retrieved successfully',
      version: '1.0.0',
    });
  }

  @Post('questions/save')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create or update a question from the Question Builder',
    description:
      'Persists question text, options, explanation, reference, tags/skills and properties. When target is "bank" the question is also stored in the reusable Question Bank.',
  })
  @ApiBody({
    type: SaveQuestionDto,
    description: 'Full question builder payload',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Question saved successfully',
    resourceType: 'question-builder',
  })
  async saveQuestion(
    @auth.CurrentUser() user: auth.AuthUser,
    @Body() dto: SaveQuestionDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new SaveQuestionCommand(dto, user.id)
    );

    return convertEntityToJsonApi(result, 'question-builder', {
      selfLink: getSelfLinkFromRequest(req, `questions/save`),
      message: dto.target === 'bank'
        ? 'Question saved to Question Bank successfully'
        : 'Question saved successfully',
      version: '1.0.0',
    });
  }

  @Delete('questions/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete a question and all associated data',
    description: 'Permanently removes question, choices, metadata, versions, hints, and media.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Question deleted successfully',
    resourceType: 'question-builder',
  })
  async deleteQuestion(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new DeleteQuestionCommand(id, user.id)
    );

    return convertEntityToJsonApi(result, 'question-builder', {
      selfLink: getSelfLinkFromRequest(req, `questions/${id}`),
      message: 'Question deleted successfully',
      version: '1.0.0',
    });
  }

  @Get('questions/:id/history')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get question version history',
    description: 'Returns all versions of a question for the History tab.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Question history retrieved successfully',
    resourceType: 'question-history',
  })
  async getQuestionHistory(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const versions = await this.queryBus.execute(
      new GetQuestionHistoryQuery(id)
    );

    return convertEntityToJsonApi(
      { id: `${id}-history`, versions },
      'question-history',
      {
        selfLink: getSelfLinkFromRequest(req, `questions/${id}/history`),
        message: 'Question history retrieved successfully',
        version: '1.0.0',
      }
    );
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
      (collection: CollectionEntity) =>
        this.mapCollectionToResponse(collection, 'Featured')
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
      (collection: CollectionEntity) =>
        this.mapCollectionToResponse(collection, 'Trending')
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
      (collection: CollectionEntity) =>
        this.mapCollectionToResponse(collection, 'Official')
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
      (collection: CollectionEntity) =>
        this.mapCollectionToResponse(collection, 'Community')
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

    const result = await this.queryBus.execute(
      new GetSavedCollectionsQuery(user.id)
    ) as { items: Array<Record<string, unknown>>; total: number };

    const mappedItems = (result.items || []).map((item) => {
      const title = String(item.title || '');
      const upperTitle = title.toUpperCase();
      let exam = 'IELTS';
      if (upperTitle.includes('TOEIC')) exam = 'TOEIC';
      else if (upperTitle.includes('TOEFL')) exam = 'TOEFL';
      else if (upperTitle.includes('CAMBRIDGE') || upperTitle.includes('CAE')) exam = 'Cambridge';
      else if (upperTitle.includes('VSTEP')) exam = 'VSTEP';
      else if (upperTitle.includes('SAT')) exam = 'SAT';

      let level = 'Intermediate';
      if (upperTitle.includes('900+') || upperTitle.includes('ADVANCED') || upperTitle.includes('C1') || upperTitle.includes('C2')) {
        level = 'Advanced';
      } else if (upperTitle.includes('B2') || upperTitle.includes('UPPER')) {
        level = 'Upper-Intermediate';
      } else if (upperTitle.includes('BEGINNER') || upperTitle.includes('BASIC') || upperTitle.includes('DRILL')) {
        level = 'Beginner';
      }

      return {
        ...item,
        exam,
        level,
        author: 'Bạn',
        tags: [exam, level],
      };
    });

    const response = convertEntityToJsonApi(
      { id: `saved-${user.id}`, items: mappedItems, total: result.total },
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

  @Get('collections/cloned')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get cloned collections for authenticated user' })
  async getClonedCollections(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:cloned:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const data = await this.queryBus.execute(
      new GetClonedCollectionsQuery(user.id)
    ) as { items: Array<Record<string, unknown>> };

    const response = convertEntityToJsonApi(
      { id: `cloned-${user.id}`, userId: user.id, totalCloned: data.items.length, items: data.items },
      'certification-collections-cloned',
      {
        selfLink: getSelfLinkFromRequest(req, 'collections/cloned'),
        message: 'Cloned collections retrieved successfully',
        version: '1.0.0',
      }
    );
    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Get('collections/completed')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get completed collections for authenticated user',
  })
  async getCompletedCollections(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:completed:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const result = await this.queryBus.execute(new GetCompletedCollectionsQuery(user.id)) as Array<Record<string, unknown>>;

    const items = (result || []).map((item) => {
      const collection = item.collection as Record<string, unknown> | null;
      const exam = item.exam as Record<string, unknown> | null;
      const examResult = item.result as Record<string, unknown> | null;
      const title = collection ? String(collection.title || '') : 'Unknown';
      const upperTitle = title.toUpperCase();

      let category = 'General';
      if (upperTitle.includes('IELTS')) category = 'IELTS';
      else if (upperTitle.includes('TOEIC')) category = 'TOEIC';
      else if (upperTitle.includes('TOEFL')) category = 'TOEFL';
      else if (upperTitle.includes('CAMBRIDGE') || upperTitle.includes('CAE')) category = 'Cambridge';

      let examType = 'Full Mock';
      if (upperTitle.includes('MINI')) examType = 'Mini Test';
      else if (upperTitle.includes('SECTION')) examType = 'Section Practice';

      const totalScore = examResult ? Number(examResult.totalScore || 0) : 0;

      return {
        id: String(item.collectionId || ''),
        ownerId: collection ? String(collection.ownerId || '') : '',
        title,
        category,
        examType,
        completedDate: examResult?.createdAt
          ? new Date(String(examResult.createdAt)).toLocaleDateString('vi-VN')
          : '',
        scoreText: `${totalScore} điểm`,
        totalItems: exam ? Number((exam as Record<string, unknown>).totalQuestions || 0) : 0,
        certificateEligible: Boolean(examResult?.passed),
      };
    });

    const response = convertEntityToJsonApi(
      { id: `completed-${user.id}`, userId: user.id, totalCompleted: items.length, items },
      'certification-collections-completed',
      {
        selfLink: getSelfLinkFromRequest(req, 'collections/completed'),
        message: 'Completed collections retrieved successfully',
        version: '1.0.0',
      }
    );
    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Get('collections/purchased')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get purchased premium collections for authenticated user',
  })
  async getPurchasedCollections(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:purchased:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const result = await this.queryBus.execute(
      new GetPurchasedCollectionsQuery(user.id)
    ) as Array<Record<string, unknown>>;

    const items = (result || []).map((purchase) => {
      const collection = purchase.collection as Record<string, unknown> | null;
      const title = collection ? String(collection.title || '') : 'Unknown';
      const upperTitle = title.toUpperCase();
      let exam = 'IELTS';
      if (upperTitle.includes('TOEIC')) exam = 'TOEIC';
      else if (upperTitle.includes('TOEFL')) exam = 'TOEFL';
      else if (upperTitle.includes('CAMBRIDGE') || upperTitle.includes('CAE')) exam = 'Cambridge';
      else if (upperTitle.includes('VSTEP')) exam = 'VSTEP';
      else if (upperTitle.includes('SAT')) exam = 'SAT';

      return {
        id: String(purchase.id || ''),
        collectionId: String(purchase.collectionId || ''),
        ownerId: collection ? String(collection.ownerId || '') : '',
        title,
        exam,
        purchasedAt: purchase.purchasedAt ? new Date(String(purchase.purchasedAt)).toLocaleDateString('vi-VN') : '',
        price: Number(purchase.amount || 0),
      };
    });

    const response = convertEntityToJsonApi(
      { id: `purchased-${user.id}`, userId: user.id, totalPurchased: items.length, items },
      'certification-collections-purchased',
      {
        selfLink: getSelfLinkFromRequest(req, 'collections/purchased'),
        message: 'Purchased collections retrieved successfully',
        version: '1.0.0',
      }
    );
    await this.cacheService.set(cacheKey, response, 300);
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
      ownerId: result['ownerId'] ? String(result['ownerId']) : undefined,
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
    const result = await this.queryBus.execute(
      new GetCollectionReviewsQuery(id)
    );

    return convertEntityToJsonApi(
      { id: `${id}-reviews`, items: result.items, avgRating: result.avgRating },
      'certification-collection-reviews',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/reviews`),
        message: 'Collection reviews retrieved successfully',
        version: '1.0.0',
      }
    );
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
    const result = await this.commandBus.execute(
      new AddCollectionReviewCommand(id, user.id, dto.rating, dto.text)
    );

    return convertEntityToJsonApi(
      result,
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
    const result = await this.queryBus.execute(
      new GetCollectionDiscussionsQuery(id)
    );

    return convertEntityToJsonApi(
      { id: `${id}-discussions`, items: result.items },
      'certification-collection-discussions',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/discussions`),
        message: 'Collection discussions retrieved successfully',
        version: '1.0.0',
      }
    );
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
    const result = await this.commandBus.execute(
      new AddCollectionDiscussionCommand(id, user.id, dto.title, dto.content)
    );

    return convertEntityToJsonApi(
      result,
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

    const activities = await this.queryBus.execute(
      new GetCollectionActivitiesQuery(id, 10)
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

  @Post('collections')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new collection', description: 'Create a new collection owned by the authenticated user.' })
  @ApiJsonApiCreatedResponse({ description: 'Collection created successfully', resourceType: 'certification-collection' })
  async createCollection(
    @Body() dto: CreateCollectionDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new CreateCollectionCommand(user.id, dto.title, dto.description)
    );
    return convertEntityToJsonApi(result, 'certification-collection', {
      selfLink: getSelfLinkFromRequest(req, `collections/${result.id}`),
      message: 'Collection created successfully',
      version: '1.0.0',
    });
  }

  @Put('collections/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a collection', description: 'Update collection title, description, or publish status.' })
  @ApiJsonApiSuccessResponse({ description: 'Collection updated successfully', resourceType: 'certification-collection' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  @ApiJsonApiErrorResponse({ status: 403, description: 'Not the collection owner' })
  async updateCollection(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new UpdateCollectionCommand(id, user.id, dto.title, dto.description, dto.subtitle, dto.level, dto.tags, dto.visibility, dto.allowDownloads, dto.coverImage, dto.publishStatus)
    );
    await this.cacheService.delete(`certification:editor:${id}`);
    return convertEntityToJsonApi(result, 'certification-collection', {
      selfLink: getSelfLinkFromRequest(req, `collections/${id}`),
      message: 'Collection updated successfully',
      version: '1.0.0',
    });
  }

  @Put('collections/:id/chapters')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Sync chapters for a collection', description: 'Replace all chapters for a collection with the provided list.' })
  @ApiJsonApiSuccessResponse({ description: 'Chapters synced successfully', resourceType: 'certification-chapter' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  @ApiJsonApiErrorResponse({ status: 403, description: 'Not the collection owner' })
  async syncChapters(
    @Param('id') id: string,
    @Body() dto: SyncChaptersDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new SyncChaptersCommand(id, user.id, dto.chapters || [])
    );
    await this.cacheService.delete(`certification:editor:${id}`);
    return convertEntityToJsonApi(
      { id, chapters: result },
      'certification-chapter',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/chapters`),
        message: 'Chapters synced successfully',
        version: '1.0.0',
      }
    );
  }

  @Delete('collections/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a collection', description: 'Soft-delete a collection owned by the authenticated user.' })
  @ApiJsonApiSuccessResponse({ description: 'Collection deleted successfully', resourceType: 'certification-collection' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  @ApiJsonApiErrorResponse({ status: 403, description: 'Not the collection owner' })
  async deleteCollection(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new DeleteCollectionCommand(id, user.id)
    );
    await this.cacheService.delete(`certification:editor:${id}`);
    return convertEntityToJsonApi({ id, ...result }, 'certification-collection', {
      selfLink: getSelfLinkFromRequest(req, `collections/${id}`),
      message: 'Collection deleted successfully',
      version: '1.0.0',
    });
  }

  @Post('collections/:id/exams')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new exam in a collection', description: 'Add a new exam to the specified collection.' })
  @ApiJsonApiCreatedResponse({ description: 'Exam created successfully', resourceType: 'certification-exam' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  async createExam(
    @Param('id') collectionId: string,
    @Body() dto: CreateExamDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new CreateExamCommand(user.id, collectionId, dto.title, dto.description, dto.duration, dto.totalQuestions, dto.maxScore, dto.passScore, dto.examType, dto.certificationType, dto.level, dto.chapterId, dto.sections)
    );
    await this.cacheService.delete(`certification:editor:${collectionId}`);
    return convertEntityToJsonApi(result, 'certification-exam', {
      selfLink: getSelfLinkFromRequest(req, `collections/${collectionId}/exams/${result.id}`),
      message: 'Exam created successfully',
      version: '1.0.0',
    });
  }

  @Put('exams/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update an exam', description: 'Update exam metadata (title, duration, etc).' })
  @ApiJsonApiSuccessResponse({ description: 'Exam updated successfully', resourceType: 'certification-exam' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Exam not found' })
  @ApiJsonApiErrorResponse({ status: 403, description: 'Not the collection owner' })
  async updateExam(
    @Param('id') examId: string,
    @Body() dto: UpdateExamDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new UpdateExamCommand(examId, user.id, dto.title, dto.description, dto.duration, dto.totalQuestions, dto.maxScore, dto.passScore, dto.examType, dto.publishStatus, dto.certificationType)
    );
    if (result.collectionId) {
      await this.cacheService.delete(`certification:editor:${result.collectionId}`);
    }
    return convertEntityToJsonApi(result, 'certification-exam', {
      selfLink: getSelfLinkFromRequest(req, `exams/${examId}`),
      message: 'Exam updated successfully',
      version: '1.0.0',
    });
  }

  @Delete('exams/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete an exam', description: 'Soft-delete an exam from its collection.' })
  @ApiJsonApiSuccessResponse({ description: 'Exam deleted successfully', resourceType: 'certification-exam' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Exam not found' })
  @ApiJsonApiErrorResponse({ status: 403, description: 'Not the collection owner' })
  async deleteExam(
    @Param('id') examId: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new DeleteExamCommand(examId, user.id)
    );
    if (result.collectionId) {
      await this.cacheService.delete(`certification:editor:${result.collectionId}`);
    }
    return convertEntityToJsonApi({ id: examId, ...result }, 'certification-exam', {
      selfLink: getSelfLinkFromRequest(req, `exams/${examId}`),
      message: 'Exam deleted successfully',
      version: '1.0.0',
    });
  }

  @Put('exams/:id/sections')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Save exam sections', description: 'Replace all sections for an exam with the provided list.' })
  @ApiJsonApiSuccessResponse({ description: 'Sections saved successfully', resourceType: 'exam-sections' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Exam not found' })
  async saveExamSections(
    @Param('id') examId: string,
    @Body() dto: SaveExamSectionsDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new SaveExamSectionsCommand(examId, user.id, dto.sections)
    );
    return convertEntityToJsonApi({ id: examId, sections: result }, 'exam-sections', {
      selfLink: getSelfLinkFromRequest(req, `exams/${examId}/sections`),
      message: 'Sections saved successfully',
      version: '1.0.0',
    });
  }

  @Post('exams/link-question')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Link a question to an exam', description: 'Creates an ExamQuestion record linking a question to an exam.' })
  @ApiJsonApiCreatedResponse({ description: 'Question linked successfully', resourceType: 'exam-question' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Exam or question not found' })
  async linkQuestionToExam(
    @Body() dto: LinkQuestionToExamDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new LinkQuestionToExamCommand(
        dto.examId,
        dto.questionId,
        user.id,
        dto.order,
        dto.points,
        dto.sectionId,
        {
          audioUrl: dto.audioUrl,
          imageUrl: dto.imageUrl,
          partNumber: dto.partNumber,
          gapNumber: dto.gapNumber,
          writingTaskType: dto.writingTaskType,
          speakingPrompt: dto.speakingPrompt,
          isGridIn: dto.isGridIn,
          formatMetadata: dto.formatMetadata,
        }
      )
    );
    return convertEntityToJsonApi({ id: result.examQuestionId, ...result }, 'exam-question', {
      selfLink: getSelfLinkFromRequest(req, `exams/link-question`),
      message: 'Question linked to exam successfully',
      version: '1.0.0',
    });
  }

  @Delete('exams/:examId/questions/:questionId')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Unlink a question from an exam', description: 'Removes the ExamQuestion record linking a question to an exam.' })
  @ApiJsonApiSuccessResponse({ description: 'Question unlinked successfully', resourceType: 'exam-question' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Exam or link not found' })
  async unlinkQuestionFromExam(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    await this.commandBus.execute(
      new UnlinkQuestionFromExamCommand(examId, questionId, user.id)
    );
    return convertEntityToJsonApi({ id: `${examId}-${questionId}` }, 'exam-question', {
      selfLink: getSelfLinkFromRequest(req, `exams/${examId}/questions/${questionId}`),
      message: 'Question unlinked from exam successfully',
      version: '1.0.0',
    });
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
    await this.cacheService.delete(`certification:saved:${user.id}`);
    await this.cacheService.delete(`certification:bookmarks:${user.id}`);
    return convertEntityToJsonApi(
      { id, ...result },
      'certification-collection-save',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/save`),
        message: result.saved ? 'Collection saved successfully' : 'Collection unsaved successfully',
        version: '1.0.0',
      }
    );
  }

  @Post('collections/:id/favorite')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Add a collection to favorites',
    description:
      "Add a collection to the authenticated user's favorites list.",
  })
  @ApiJsonApiSuccessResponse({
    description: 'Collection favorited successfully',
    resourceType: 'certification-collection-favorite',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Collection not found' })
  async addFavorite(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new AddFavoriteCommand(user.id, id)
    );
    await this.cacheService.delete(`certification:favorites:${user.id}`);
    return convertEntityToJsonApi(
      { id, ...result },
      'certification-collection-favorite',
      {
        selfLink: getSelfLinkFromRequest(req, `collections/${id}/favorite`),
        message: 'Collection favorited successfully',
        version: '1.0.0',
      }
    );
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
      new SaveReportCommand(
        id,
        user.id,
        dto.reason || 'Inappropriate content'
      )
    );
    return convertEntityToJsonApi(
      { id: result.id, collectionId: id, reason: result.reason, createdAt: result.createdAt },
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

  @Get('sessions/in-progress')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get in-progress exam sessions for authenticated user' })
  async getInProgressSessions(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:in-progress:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const sessions = await this.queryBus.execute(
      new GetInProgressSessionsQuery(user.id)
    ) as Array<{
      id: string;
      examId: string;
      status: string;
      startedAt: Date;
      exam: { title: string; totalQuestions: number } | null;
    }>;

    const items = (sessions || []).map((session) => {
      const exam = session.exam;
      const startedAt = new Date(session.startedAt);
      const now = new Date();
      const minutesAgo = Math.round((now.getTime() - startedAt.getTime()) / 60000);
      const timeAgo = minutesAgo < 60 ? `${minutesAgo} phút trước` : `${Math.round(minutesAgo / 60)} giờ trước`;

      return {
        id: session.id,
        examId: session.examId,
        title: exam ? exam.title : 'Unknown Exam',
        status: session.status,
        startedAt: session.startedAt,
        timeAgo,
        examTitle: exam ? exam.title : 'Unknown',
        totalQuestions: exam ? exam.totalQuestions : 0,
      };
    });

    const response = convertEntityToJsonApi(
      { id: `in-progress-${user.id}`, userId: user.id, totalInProgress: items.length, items },
      'certification-sessions-in-progress',
      {
        selfLink: getSelfLinkFromRequest(req, 'sessions/in-progress'),
        message: 'In-progress sessions retrieved successfully',
        version: '1.0.0',
      }
    );
    await this.cacheService.set(cacheKey, response, 300);
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
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: SaveSessionAnswerDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new SaveSessionAnswerCommand(
        sessionId,
        dto.questionId,
        user.id,
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
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: RecordSessionViolationDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new RecordSessionViolationCommand(
        sessionId,
        user.id,
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

  @Get('history')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get practice session history for authenticated user',
  })
  async getPracticeHistory(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:history:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const result = await this.queryBus.execute(new GetPracticeHistoryQuery(user.id)) as Array<Record<string, unknown>>;

    const items = (result || []).map((session) => {
      const exam = session.exam as Record<string, unknown> | null;
      const examResult = session.result as Record<string, unknown> | null;
      const examTitle = exam ? String(exam.title || '') : 'Unknown Exam';
      const startedAt = session.startedAt ? new Date(String(session.startedAt)) : new Date();
      const endedAt = session.endedAt ? new Date(String(session.endedAt)) : null;
      const timeSpentMin = endedAt ? Math.round((endedAt.getTime() - startedAt.getTime()) / 60000) : 0;

      let examType = 'Mock Test';
      const upperTitle = examTitle.toUpperCase();
      if (upperTitle.includes('MINI') || upperTitle.includes('SECTION')) examType = 'Practice by Part';
      else if (upperTitle.includes('QUIZ')) examType = 'Quiz';
      else if (upperTitle.includes('AI')) examType = 'AI Practice';

      const totalScore = examResult ? Number(examResult.totalScore || 0) : 0;
      const passed = examResult ? Boolean(examResult.passed) : false;

      return {
        id: String(session.sessionId || ''),
        code: examTitle.substring(0, 20),
        title: examTitle,
        type: examType,
        examPart: upperTitle.includes('READING') ? 'Reading' : upperTitle.includes('LISTENING') ? 'Listening' : upperTitle.includes('WRITING') ? 'Writing' : upperTitle.includes('SPEAKING') ? 'Speaking' : 'Full Test',
        scoreDisplay: examResult ? `${totalScore}` : '-',
        scoreSub: passed ? 'Đạt' : 'Chưa đạt',
        timeSpent: `${timeSpentMin} phút`,
        dateDisplay: startedAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      };
    });

    const response = convertEntityToJsonApi(
      { id: `history-${user.id}`, userId: user.id, totalSessions: items.length, items },
      'certification-history',
      {
        selfLink: getSelfLinkFromRequest(req, 'history'),
        message: 'Practice history retrieved successfully',
        version: '1.0.0',
      }
    );
    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Get('favorites')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get user favorite items and collections',
  })
  async getFavorites(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:favorites:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const result = await this.queryBus.execute(new GetFavoritesQuery(user.id)) as Array<Record<string, unknown>>;

    const items = (result || []).map((fav) => {
      const collection = fav.collection as Record<string, unknown> | null;
      const title = collection ? String(collection.title || '') : 'Unknown';
      const upperTitle = title.toUpperCase();
      let exam = 'IELTS';
      if (upperTitle.includes('TOEIC')) exam = 'TOEIC';
      else if (upperTitle.includes('TOEFL')) exam = 'TOEFL';
      else if (upperTitle.includes('CAMBRIDGE') || upperTitle.includes('CAE')) exam = 'Cambridge';
      else if (upperTitle.includes('VSTEP')) exam = 'VSTEP';
      else if (upperTitle.includes('SAT')) exam = 'SAT';

      return {
        id: String(fav.id || ''),
        collectionId: String(fav.collectionId || ''),
        ownerId: collection ? String(collection.ownerId || '') : '',
        title,
        exam,
        addedAt: fav.createdAt ? new Date(String(fav.createdAt)).toLocaleDateString('vi-VN') : '',
      };
    });

    const response = convertEntityToJsonApi(
      { id: `favorites-${user.id}`, userId: user.id, totalFavorites: items.length, items },
      'certification-favorites',
      {
        selfLink: getSelfLinkFromRequest(req, 'favorites'),
        message: 'Favorites retrieved successfully',
        version: '1.0.0',
      }
    );
    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Get('bookmarks')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get user bookmarks and folders',
  })
  async getBookmarks(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:bookmarks:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const result = await this.queryBus.execute(new GetBookmarksQuery(user.id)) as Array<Record<string, unknown>>;

    const items = (result || []).map((bm) => {
      const collection = bm.collection as Record<string, unknown> | null;
      const title = collection ? String(collection.title || '') : 'Unknown';

      return {
        id: String(bm.id || ''),
        itemId: String(bm.collectionId || ''),
        itemType: 'collection',
        ownerId: collection ? String(collection.ownerId || '') : '',
        title,
        folderName: 'Mặc định',
        createdAt: bm.createdAt ? new Date(String(bm.createdAt)).toLocaleDateString('vi-VN') : '',
      };
    });

    const response = convertEntityToJsonApi(
      { id: `bookmarks-${user.id}`, userId: user.id, totalBookmarks: items.length, items },
      'certification-bookmarks',
      {
        selfLink: getSelfLinkFromRequest(req, 'bookmarks'),
        message: 'Bookmarks retrieved successfully',
        version: '1.0.0',
      }
    );
    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Post('bookmarks')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Add a bookmark for a collection',
  })
  async addBookmark(
    @Body() body: AddBookmarkDto,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new AddBookmarkCommand(user.id, body.itemId)
    );
    await this.cacheService.delete(`certification:bookmarks:${user.id}`);
    return convertEntityToJsonApi(
      { id: body.itemId, success: result.bookmarked, bookmarkId: body.itemId },
      'certification-bookmark-add',
      {
        selfLink: getSelfLinkFromRequest(req, 'bookmarks'),
        message: 'Bookmark added successfully',
        version: '1.0.0',
      }
    );
  }

  @Get('certificates')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get user certificates',
  })
  async getCertificates(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:certificates:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const results = await this.queryBus.execute(new GetCompletedCollectionsQuery(user.id)) as Array<Record<string, unknown>>;

    const certificates = (results || [])
      .filter((item) => {
        const examResult = item.result as Record<string, unknown> | null;
        return examResult?.passed;
      })
      .map((item, index) => {
        const collection = item.collection as Record<string, unknown> | null;
        const examResult = item.result as Record<string, unknown> | null;
        const title = collection ? String(collection.title || '') : 'Unknown';
        const upperTitle = title.toUpperCase();
        let examCategory = 'General';
        if (upperTitle.includes('IELTS')) examCategory = 'IELTS';
        else if (upperTitle.includes('TOEIC')) examCategory = 'TOEIC';
        else if (upperTitle.includes('TOEFL')) examCategory = 'TOEFL';

        const totalScore = examResult ? Number(examResult.totalScore || 0) : 0;

        return {
          id: `cert-${index}-${user.id}`,
          collectionId: String(item.collectionId || ''),
          title,
          examCategory,
          issuedDate: examResult?.createdAt
            ? new Date(String(examResult.createdAt)).toLocaleDateString('vi-VN')
            : '',
          score: `${totalScore}`,
          downloadUrl: '#',
          credentialCode: `CRED-${String(item.collectionId || '').substring(0, 8).toUpperCase()}-${user.id.substring(0, 4).toUpperCase()}`,
        };
      });

    const response = convertEntityToJsonApi(
      { id: `certificates-${user.id}`, certificates },
      'certification-certificates',
      {
        selfLink: getSelfLinkFromRequest(req, 'certificates'),
        message: 'Certificates retrieved successfully',
        version: '1.0.0',
      }
    );
    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Get('certificates/:id/download')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Download a certificate',
  })
  async downloadCertificate(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    return convertEntityToJsonApi(
      { id, success: true, url: '#', message: 'Certificate download initiated' },
      'certification-certificate-download',
      {
        selfLink: getSelfLinkFromRequest(req, `certificates/${id}/download`),
        message: 'Certificate download initiated',
        version: '1.0.0',
      }
    );
  }

  @Delete('bookmarks/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Remove bookmark item by ID',
  })
  async removeBookmark(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    await this.commandBus.execute(
      new RemoveBookmarkCommand(user.id, id)
    );
    await this.cacheService.delete(`certification:bookmarks:${user.id}`);
    return convertEntityToJsonApi(
      { id, removed: true },
      'certification-bookmark-remove',
      {
        selfLink: getSelfLinkFromRequest(req, `bookmarks/${id}`),
        message: 'Bookmark removed successfully',
      }
    );
  }

  @Get('downloads')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get user offline downloads',
  })
  async getDownloads(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const cacheKey = `certification:downloads:${user.id}`;
    const cached = await this.cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;

    const result = await this.queryBus.execute(new GetDownloadsQuery(user.id));
    const response = convertEntityToJsonApi({ id: `downloads-${user.id}`, items: result }, 'certification-downloads', {
      selfLink: getSelfLinkFromRequest(req, 'downloads'),
      message: 'Downloads retrieved successfully',
      version: '1.0.0',
    });
    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  @Delete('favorites/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Remove favorite item by ID',
  })
  async removeFavorite(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    await this.commandBus.execute(
      new RemoveFavoriteCommand(user.id, id)
    );
    await this.cacheService.delete(`certification:favorites:${user.id}`);
    return convertEntityToJsonApi(
      { id, removed: true },
      'certification-favorite-remove',
      {
        selfLink: getSelfLinkFromRequest(req, `favorites/${id}`),
        message: 'Favorite item removed successfully',
      }
    );
  }

  @Delete('downloads/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete offline downloaded file by ID',
  })
  async deleteDownload(
    @Param('id') id: string,
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    await this.commandBus.execute(
      new DeleteDownloadCommand(id)
    );
    await this.cacheService.delete(`certification:downloads:${user.id}`);
    return convertEntityToJsonApi(
      { id, deleted: true },
      'certification-download-delete',
      {
        selfLink: getSelfLinkFromRequest(req, `downloads/${id}`),
        message: 'Downloaded file deleted successfully',
      }
    );
  }

  @Delete('downloads')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Clear all offline downloads',
  })
  async clearDownloads(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    await this.commandBus.execute(
      new ClearDownloadsCommand(user.id)
    );
    await this.cacheService.delete(`certification:downloads:${user.id}`);
    return convertEntityToJsonApi(
      { id: `clear-${user.id}`, cleared: true },
      'certification-downloads-clear',
      {
        selfLink: getSelfLinkFromRequest(req, 'downloads'),
        message: 'All downloads cleared successfully',
      }
    );
  }
}
