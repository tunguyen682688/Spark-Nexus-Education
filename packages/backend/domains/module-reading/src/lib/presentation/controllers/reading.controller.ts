import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
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
  createJsonApiPaginatedResponse,
  getBaseUrlFromRequest,
  ApiJsonApiSuccessResponse,
  ApiJsonApiCreatedResponse,
  ApiJsonApiPaginatedResponse,
  ApiJsonApiErrorResponse,
} from '@spark-nest-ed/shared-libs';

import { GetArticlesQueryDto } from '../../application/dtos/get-articles-query.dto';
import { UpdateReadingProgressDto } from '../../application/dtos/update-reading-progress.dto';
import { SubmitArticleQuizDto } from '../../application/dtos/submit-article-quiz.dto';
import { TranslateContextDto } from '../../application/dtos/translate-context.dto';
import { GetReadingDashboardQuery } from '../../application/querys/get-reading-dashboard/get-reading-dashboard.query';
import { GetArticlesQuery } from '../../application/querys/get-articles/get-articles.query';
import { GetArticleQuery } from '../../application/querys/get-article/get-article.query';
import { GetArticleQuizQuery } from '../../application/querys/get-article-quiz/get-article-quiz.query';
import { TranslateWordInContextQuery } from '../../application/querys/translate-word-in-context/translate-word-in-context.query';
import { UpdateReadingProgressCommand } from '../../application/commands/update-reading-progress/update-reading-progress.command';
import { SubmitArticleQuizCommand } from '../../application/commands/submit-article-quiz/submit-article-quiz.command';
import { CreateCommunityArticleDto } from '../../application/dtos/create-community-article.dto';
import { InteractArticleDto } from '../../application/dtos/interact-article.dto';
import { AddArticleCommentDto } from '../../application/dtos/add-article-comment.dto';
import { CreateCommunityArticleCommand } from '../../application/commands/create-community-article/create-community-article.command';
import { InteractArticleCommand } from '../../application/commands/interact-article/interact-article.command';
import { AddArticleCommentCommand } from '../../application/commands/add-article-comment/add-article-comment.command';
import { GetCommunityArticlesQuery } from '../../application/querys/get-community-articles/get-community-articles.query';

// Studio DTOs & Commands
import { CreateStudioArticleDto } from '../../application/dtos/create-studio-article.dto';
import { UpdateStudioArticleDto } from '../../application/dtos/update-studio-article.dto';
import { CreateStudioArticleCommand } from '../../application/commands/create-studio-article/create-studio-article.command';
import { UpdateStudioArticleCommand } from '../../application/commands/update-studio-article/update-studio-article.command';
import { DeleteStudioArticleCommand } from '../../application/commands/delete-studio-article/delete-studio-article.command';
import { GetMyArticlesQuery } from '../../application/querys/get-my-articles/get-my-articles.query';

@ApiTags('Reading')
@Controller('reading')
export class ReadingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get('dashboard')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get reading dashboard summary',
    description: 'Retrieves user progress stats, books being read, trending publications, weekly activity streak, and lookups.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Reading dashboard retrieved successfully',
    resourceType: 'reading-dashboard',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async getDashboard(
    @auth.CurrentUser() user: auth.AuthUser,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new GetReadingDashboardQuery(user.id)
    );
    
    const dashboardEntity = {
      id: user.id,
      ...result
    };

    return convertEntityToJsonApi(dashboardEntity, 'reading-dashboard', {
      selfLink: getSelfLinkFromRequest(req, 'dashboard'),
      message: 'Reading dashboard retrieved successfully',
      version: '1.0.0',
    });
  }

  @Get('articles')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'List and filter reading articles',
    description: 'Retrieves paginated reading articles with filters for difficulty, category, status (in-progress/completed), and search query.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Articles retrieved successfully',
    resourceType: 'article',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async getArticles(
    @auth.CurrentUser() user: auth.AuthUser,
    @Query() query: GetArticlesQueryDto,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new GetArticlesQuery(query, user.id)
    );

    return createJsonApiPaginatedResponse(
      result.data,
      result.meta.total,
      'article',
      getBaseUrlFromRequest(req),
      result.meta,
      {
        message: 'Articles retrieved successfully',
        version: '1.0.0',
      }
    );
  }

  @Get('articles/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get article details by ID',
    description: 'Retrieves detailed content of an article including the user\'s reading progress.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Article retrieved successfully',
    resourceType: 'article',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Article not found' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async getArticle(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new GetArticleQuery(id, user.id)
    );

    return convertEntityToJsonApi(result, 'article', {
      selfLink: getSelfLinkFromRequest(req, result.id),
      message: 'Article retrieved successfully',
      version: '1.0.0',
    });
  }

  @Put('articles/:id/progress')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update reading progress for an article',
    description: 'Saves or updates the reading progress percent, scroll position, and time spent on a specific article.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Reading progress updated successfully',
    resourceType: 'reading-progress',
  })
  @ApiJsonApiErrorResponse({ status: 400, description: 'Bad Request' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Article not found' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async updateProgress(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateReadingProgressDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new UpdateReadingProgressCommand(
        user.id,
        id,
        dto.progress,
        dto.lastPosition,
        dto.timeSpent
      )
    );

    return convertEntityToJsonApi(result, 'reading-progress', {
      selfLink: `${getSelfLinkFromRequest(req, id)}/progress`,
      message: 'Reading progress updated successfully',
      version: '1.0.0',
    });
  }

  @Get('articles/:id/quiz')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get reading comprehension quiz for an article',
    description: 'Retrieves multiple choice questions without exposing correct answers.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Article quiz retrieved successfully',
    resourceType: 'article-quiz',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Article or quiz not found' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async getArticleQuiz(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new GetArticleQuizQuery(id, user.id)
    );

    return convertEntityToJsonApi(result, 'article-quiz', {
      selfLink: `${getSelfLinkFromRequest(req, id)}/quiz`,
      message: 'Article quiz retrieved successfully',
      version: '1.0.0',
    });
  }

  @Post('articles/:id/quiz/submit')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Submit reading comprehension quiz answers',
    description: 'Evaluates user answers, calculates score, and provides explanations.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Article quiz evaluated successfully',
    resourceType: 'article-quiz-result',
  })
  @ApiJsonApiErrorResponse({ status: 400, description: 'Bad Request' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Article or quiz not found' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async submitArticleQuiz(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: SubmitArticleQuizDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(
      new SubmitArticleQuizCommand(user.id, id, dto.answers)
    );

    return convertEntityToJsonApi(result, 'article-quiz-result', {
      selfLink: `${getSelfLinkFromRequest(req, id)}/quiz/submit`,
      message: 'Article quiz evaluated successfully',
      version: '1.0.0',
    });
  }

  @Post('translate-context')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Translate word in context',
    description: 'Translates a vocabulary word using context clues from the sentence.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Contextual translation calculated successfully',
    resourceType: 'contextual-translation',
  })
  @ApiJsonApiErrorResponse({ status: 400, description: 'Bad Request' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async translateContext(
    @Body() dto: TranslateContextDto,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(
      new TranslateWordInContextQuery(dto.word, dto.sentence)
    );
    const apiResult = {
      id: dto.word,
      ...result
    };

    return convertEntityToJsonApi(apiResult, 'contextual-translation', {
      selfLink: getSelfLinkFromRequest(req, 'translate-context'),
      message: 'Contextual translation calculated successfully',
      version: '1.0.0',
    });
  }

  @Get('articles/community/list')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get community articles',
    description: 'Retrieves a list of reading articles created by the community, sorted by trending, newest, or top.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Community articles retrieved successfully',
    resourceType: 'article-list',
  })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async getCommunityArticles(
    @auth.CurrentUser() user: auth.AuthUser,
    @Query('sortBy') sortBy: 'trending' | 'newest' | 'top',
    @Query('limit') limit: number,
    @Req() req: express.Request
  ) {
    const safeSortBy = ['trending', 'newest', 'top'].includes(sortBy) ? sortBy : 'trending';
    const safeLimit = limit ? Number(limit) : 10;
    
    const result = await this.queryBus.execute(
      new GetCommunityArticlesQuery(safeSortBy as 'trending' | 'newest' | 'top', safeLimit, user.id)
    );

    return createJsonApiPaginatedResponse(
      result,
      result.length,
      'article',
      getBaseUrlFromRequest(req),
      { total: result.length, limit: safeLimit, page: 1, totalPages: 1 },
      {
        message: 'Community articles retrieved successfully',
        version: '1.0.0',
      }
    );
  }

  @Post('articles/community')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a community article',
    description: 'Allows a user to create and publish a new reading article to the community.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Community article created successfully',
    resourceType: 'article',
  })
  @ApiJsonApiErrorResponse({ status: 400, description: 'Bad Request' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async createCommunityArticle(
    @auth.CurrentUser() user: auth.AuthUser,
    @Body() dto: CreateCommunityArticleDto,
    @Req() req: express.Request
  ) {
    const articleId = await this.commandBus.execute(
      new CreateCommunityArticleCommand(
        user.id,
        dto.title,
        dto.content,
        undefined, // summary
        dto.category,
        [], // tags
        undefined // difficulty
      )
    );

    return convertEntityToJsonApi({ id: articleId }, 'article', {
      selfLink: getSelfLinkFromRequest(req, 'articles/community'),
      message: 'Community article created successfully',
      version: '1.0.0',
    });
  }

  @Post('articles/:id/vote')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Vote on an article',
    description: 'Upvote, downvote, or bookmark an article.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Article interaction recorded successfully',
    resourceType: 'article-interaction',
  })
  @ApiJsonApiErrorResponse({ status: 400, description: 'Bad Request' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async interactArticle(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: InteractArticleDto,
    @Req() req: express.Request
  ) {
    await this.commandBus.execute(
      new InteractArticleCommand(id, user.id, dto.action)
    );

    return convertEntityToJsonApi({ id, action: dto.action }, 'article-interaction', {
      selfLink: `${getSelfLinkFromRequest(req, id)}/vote`,
      message: 'Article interaction recorded successfully',
      version: '1.0.0',
    });
  }

  @Post('articles/:id/comment')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Add a comment to an article',
    description: 'Leave a comment or review on a reading article.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Comment added successfully',
    resourceType: 'article-comment',
  })
  @ApiJsonApiErrorResponse({ status: 400, description: 'Bad Request' })
  @ApiJsonApiErrorResponse({ status: 401, description: 'Unauthorized' })
  async addArticleComment(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: AddArticleCommentDto,
    @Req() req: express.Request
  ) {
    const commentId = await this.commandBus.execute(
      new AddArticleCommentCommand(id, user.id, dto.content)
    );

    return convertEntityToJsonApi({ id: commentId }, 'article-comment', {
      selfLink: `${getSelfLinkFromRequest(req, id)}/comment`,
      message: 'Comment added successfully',
      version: '1.0.0',
    });
  }

  // ==========================================
  // Studio API Endpoints
  // ==========================================

  @Post('articles/studio')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create an article via Studio',
    description: 'Allows a user to create a new article from the studio.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Article created successfully',
    resourceType: 'article',
  })
  async createStudioArticle(
    @auth.CurrentUser() user: auth.AuthUser,
    @Body() dto: CreateStudioArticleDto,
    @Req() req: express.Request
  ) {
    const articleId = await this.commandBus.execute(
      new CreateStudioArticleCommand(
        user.id,
        dto.title,
        dto.content,
        dto.category,
        dto.summary,
        dto.difficulty,
        dto.tags,
        dto.thumbnailUrl,
        dto.sourceUrl,
        dto.author,
        dto.status
      )
    );

    return convertEntityToJsonApi({ id: articleId }, 'article', {
      selfLink: getSelfLinkFromRequest(req, 'articles/studio'),
      message: 'Article created successfully',
      version: '1.0.0',
    });
  }

  @Put('articles/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update an article via Studio',
    description: 'Allows a user to update their own article from the studio.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Article updated successfully',
    resourceType: 'article',
  })
  async updateStudioArticle(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStudioArticleDto,
    @Req() req: express.Request
  ) {
    const articleId = await this.commandBus.execute(
      new UpdateStudioArticleCommand(
        user.id,
        id,
        dto.title,
        dto.content,
        dto.category,
        dto.summary,
        dto.difficulty,
        dto.tags,
        dto.thumbnailUrl,
        dto.sourceUrl,
        dto.author,
        dto.status
      )
    );

    return convertEntityToJsonApi({ id: articleId }, 'article', {
      selfLink: getSelfLinkFromRequest(req, id),
      message: 'Article updated successfully',
      version: '1.0.0',
    });
  }

  @Put('articles/:id/draft')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Save an article as draft via Studio',
    description: 'Allows a user to update their own article and save as draft.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Article draft saved successfully',
    resourceType: 'article',
  })
  async saveStudioArticleDraft(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStudioArticleDto,
    @Req() req: express.Request
  ) {
    const articleId = await this.commandBus.execute(
      new UpdateStudioArticleCommand(
        user.id,
        id,
        dto.title,
        dto.content,
        dto.category,
        dto.summary,
        dto.difficulty,
        dto.tags,
        dto.thumbnailUrl,
        dto.sourceUrl,
        dto.author,
        'DRAFT'
      )
    );

    return convertEntityToJsonApi({ id: articleId }, 'article', {
      selfLink: getSelfLinkFromRequest(req, id),
      message: 'Article draft saved successfully',
      version: '1.0.0',
    });
  }

  @Post('articles/:id/delete') // Or @Delete('articles/:id')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete an article via Studio',
    description: 'Allows a user to delete their own article.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Article deleted successfully',
    resourceType: 'article',
  })
  async deleteStudioArticle(
    @auth.CurrentUser() user: auth.AuthUser,
    @Param('id') id: string,
    @Req() req: express.Request
  ) {
    await this.commandBus.execute(new DeleteStudioArticleCommand(user.id, id));

    return convertEntityToJsonApi({ id }, 'article', {
      selfLink: getSelfLinkFromRequest(req, id),
      message: 'Article deleted successfully',
      version: '1.0.0',
    });
  }

  @Get('articles/my/list')
  @UseGuards(auth.JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get my articles',
    description: 'Retrieve articles created by the current user.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'My articles retrieved successfully',
    resourceType: 'article',
  })
  async getMyArticles(
    @auth.CurrentUser() user: auth.AuthUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Req() req: express.Request
  ) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    const { data, meta } = await this.queryBus.execute(
      new GetMyArticlesQuery(user.id, safePage, safeLimit)
    );

    return createJsonApiPaginatedResponse(
      data,
      meta.total,
      'article',
      getBaseUrlFromRequest(req),
      { total: meta.total, limit: meta.limit, page: meta.page, totalPages: meta.totalPages },
      {
        message: 'My articles retrieved successfully',
        version: '1.0.0',
      }
    );
  }
}
