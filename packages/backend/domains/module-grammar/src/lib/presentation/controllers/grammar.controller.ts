import { Controller, Get, Param, Post, Put, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard, CurrentUser, PermissionsGuard, Permissions } from '@spark-nest-ed/infrastructure-auth';
import express from 'express';

import {
  ApiJsonApiSuccessResponse,
  ApiJsonApiCreatedResponse,
  ApiJsonApiErrorResponse,
  ApiJsonApiPaginatedResponse,
  convertEntityToJsonApi,
  createJsonApiPaginatedResponse,
  getSelfLinkFromRequest,
  getBaseUrlFromRequest,
  createQueryParamsFromObject,
} from '@spark-nest-ed/shared-libs';

// DTOs
import { CreateExamSetDto, SubmitExamAttemptDto } from '../../application/dtos/grammar-exam.dtos';
import { SaveGrammarTrapDto } from '../../application/dtos/grammar-trap.dtos';
import { CreateLessonDto, UpdateLessonDto, UpdateProgressDto } from '../../application/dtos/grammar-lesson.dtos';
import { CreateCommunityPostDto, AddCommunityCommentDto, SubmitCrowdsourcedQuizDto } from '../../application/dtos/grammar-community.dtos';
import { SubmitDailyQuizDto, SubmitGraduationExamDto, SubmitSrsFeedbackDto } from '../../application/dtos/grammar-practice.dtos';

// Commands
import { CreateLessonCommand } from '../../application/commands/create-lesson';
import { UpdateLessonCommand } from '../../application/commands/update-lesson';
import { CompleteLessonCommand } from '../../application/commands/complete-lesson';
import { UpdateLessonProgressCommand } from '../../application/commands/update-lesson-progress';
import { SubmitDailyQuizCommand } from '../../application/commands/submit-daily-quiz';
import { SubmitGraduationExamCommand } from '../../application/commands/submit-graduation-exam';
import { CreateCommunityPostCommand } from '../../application/commands/create-community-post';
import { AddCommunityCommentCommand } from '../../application/commands/add-community-comment';
import { LikeCommunityPostCommand } from '../../application/commands/like-community-post';
import { SubmitCrowdsourcedQuizCommand } from '../../application/commands/submit-crowdsourced-quiz';
import { UpvoteCrowdsourcedQuizCommand } from '../../application/commands/upvote-crowdsourced-quiz';
import { SubmitSrsFeedbackCommand } from '../../application/commands/submit-srs-feedback';
import { CreateExamSetCommand } from '../../application/commands/create-exam-set';
import { UpvoteExamSetCommand } from '../../application/commands/upvote-exam-set';
import { SubmitExamAttemptCommand } from '../../application/commands/submit-exam-attempt';
import { SaveGrammarTrapCommand } from '../../application/commands/save-grammar-trap';
import { BreakGrammarTrapCommand } from '../../application/commands/break-grammar-trap';
import { GenerateAiTrapAnalysisCommand } from '../../application/commands/generate-ai-trap-analysis';

// Queries
import { GetRoadmapQuery } from '../../application/queries/get-roadmap';
import { GetLessonDetailQuery } from '../../application/queries/get-lesson-detail';
import { GetDailyQuizQuery } from '../../application/queries/get-daily-quiz';
import { GetPracticeQuestionsQuery } from '../../application/queries/get-practice-questions';
import { GetCommunityPostsQuery } from '../../application/queries/get-community-posts';
import { GetCrowdsourcedQuizzesQuery } from '../../application/queries/get-crowdsourced-quizzes';
import { GetSrsDueQuizzesQuery } from '../../application/queries/get-srs-due-quizzes';
import { GetExamSetsQuery } from '../../application/queries/get-exam-sets';
import { GetUserCertificatesQuery } from '../../application/queries/get-user-certificates';
import { GetGrammarTrapsQuery } from '../../application/queries/get-grammar-traps';
import { GetLeaderboardQuery } from '../../application/queries/get-leaderboard';
import { GetAnalyticsSummaryQuery } from '../../application/queries/get-analytics-summary';

import { GrammarAbilitiesGuard } from '../guards/grammar-abilities.guard';

@ApiTags('grammar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@Controller('grammar')
export class GrammarController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus 
  ) {}

  @Get('leaderboard')
  @ApiOperation({
    summary: 'Lấy bảng xếp hạng học viên ngữ pháp',
    description: 'Retrieve the top students ranked by grammar progression, weekly, monthly, or all-time.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Leaderboard retrieved successfully',
    resourceType: 'grammar-leaderboard',
  })
  async getLeaderboard(
    @Query('timeframe') timeframe: 'week' | 'month' | 'all-time' | undefined,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(new GetLeaderboardQuery(timeframe));
    const selfLink = getBaseUrlFromRequest(req);
    return convertEntityToJsonApi(result, 'grammar-leaderboard', {
      selfLink,
      message: 'Leaderboard retrieved successfully',
      version: '1.0.0',
    });
  }

  @Get('roadmap')
  @ApiOperation({
    summary: 'Lấy lộ trình học ngữ pháp toàn diện',
    description: 'Retrieve the personalized grammar learning roadmap for the current user, including details of CEFR levels.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Roadmap retrieved successfully',
    resourceType: 'grammar-roadmap',
  })
  async getRoadmap(@CurrentUser('id') userId: string, @Req() req: express.Request) {
    const result = await this.queryBus.execute(new GetRoadmapQuery(userId));
    const selfLink = getBaseUrlFromRequest(req);
    return convertEntityToJsonApi(result, 'grammar-roadmap', {
      selfLink,
      message: 'Roadmap retrieved successfully',
      version: '1.0.0',
    });
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Lấy dữ liệu phân tích năng lực ngữ pháp nâng cao',
    description: 'Retrieve student proficiency details and analytics across syntax, tenses, morphology, and modality.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Analytics summary retrieved successfully',
    resourceType: 'grammar-analytics',
  })
  async getAnalyticsSummary(@CurrentUser('id') userId: string, @Req() req: express.Request) {
    const result = await this.queryBus.execute(new GetAnalyticsSummaryQuery(userId));
    const selfLink = getBaseUrlFromRequest(req);
    return convertEntityToJsonApi(result, 'grammar-analytics', {
      selfLink,
      message: 'Analytics summary retrieved successfully',
      version: '1.0.0',
    });
  }

  @Get('lessons/:id')
  @ApiOperation({
    summary: 'Lấy chi tiết một bài học ngữ pháp',
    description: 'Retrieve full grammar lesson details, outline, theory blocks, and current user progress.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Lesson details retrieved successfully',
    resourceType: 'grammar-lesson',
  })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Lesson not found' })
  async getLessonDetail(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.queryBus.execute(new GetLessonDetailQuery(id, userId));
    const selfLink = getSelfLinkFromRequest(req, id);
    return convertEntityToJsonApi(result, 'grammar-lesson', {
      selfLink,
      message: 'Lesson details retrieved successfully',
      version: '1.0.0',
    });
  }

  @Post('lessons')
  @UseGuards(PermissionsGuard)
  @Permissions('write:admin')
  @ApiOperation({
    summary: 'Tạo bài học ngữ pháp mới',
    description: 'Create a new grammar lesson. Admin access required.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Lesson created successfully',
    resourceType: 'grammar-lesson',
  })
  @ApiJsonApiErrorResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiJsonApiErrorResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async createLesson(@Body() body: CreateLessonDto, @Req() req: express.Request) {
    const result = await this.commandBus.execute(new CreateLessonCommand(body));
    const selfLink = getSelfLinkFromRequest(req, result.id);
    return convertEntityToJsonApi(result, 'grammar-lesson', {
      selfLink,
      message: 'Lesson created successfully',
      version: '1.0.0',
    });
  }

  @Put('lessons/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('write:admin')
  @ApiOperation({
    summary: 'Cập nhật bài học ngữ pháp',
    description: 'Update a grammar lesson. Admin access required.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Lesson updated successfully',
    resourceType: 'grammar-lesson',
  })
  @ApiJsonApiErrorResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiJsonApiErrorResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiJsonApiErrorResponse({ status: 404, description: 'Lesson not found' })
  async updateLesson(
    @Param('id') id: string,
    @Body() body: UpdateLessonDto,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new UpdateLessonCommand(id, body));
    const selfLink = getSelfLinkFromRequest(req, id);
    return convertEntityToJsonApi(result, 'grammar-lesson', {
      selfLink,
      message: 'Lesson updated successfully',
      version: '1.0.0',
    });
  }

  @Post('lessons/:id/complete')
  @ApiOperation({
    summary: 'Hoàn thành bài học ngữ pháp',
    description: 'Mark the grammar lesson status as MASTERED/completed for the current user.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Lesson completed successfully',
    resourceType: 'grammar-lesson-progress',
  })
  async completeLesson(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new CompleteLessonCommand(id, userId));
    const selfLink = getSelfLinkFromRequest(req, `${id}/complete`);
    return convertEntityToJsonApi(result, 'grammar-lesson-progress', {
      selfLink,
      message: 'Lesson completed successfully',
      version: '1.0.0',
    });
  }

  @Put('lessons/:id/progress')
  @ApiOperation({
    summary: 'Cập nhật ghi chú nhanh hoặc tiến trình học tập',
    description: 'Update study notes, proficiency score, or current status of a lesson.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Lesson progress updated successfully',
    resourceType: 'grammar-lesson-progress',
  })
  async updateProgress(
    @Param('id') id: string,
    @Body() body: UpdateProgressDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new UpdateLessonProgressCommand(id, userId, body));
    const selfLink = getSelfLinkFromRequest(req, `${id}/progress`);
    return convertEntityToJsonApi(result, 'grammar-lesson-progress', {
      selfLink,
      message: 'Lesson progress updated successfully',
      version: '1.0.0',
    });
  }

  @Get('daily-quiz')
  @ApiOperation({
    summary: 'Lấy câu hỏi Daily Quiz ngẫu nhiên hằng ngày',
    description: 'Fetch a random set of daily grammar quiz challenges.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Daily quiz retrieved successfully',
    resourceType: 'grammar-daily-quiz',
  })
  async getDailyQuiz(@Req() req: express.Request) {
    const result = await this.queryBus.execute(new GetDailyQuizQuery());
    const selfLink = getBaseUrlFromRequest(req);
    return convertEntityToJsonApi(result, 'grammar-daily-quiz', {
      selfLink,
      message: 'Daily quiz retrieved successfully',
      version: '1.0.0',
    });
  }

  @Get('practice/questions')
  @ApiOperation({
    summary: 'Lấy câu hỏi thực hành ngữ pháp nâng cao đa dạng',
    description: 'Retrieve specialized grammar practice questions filtered by level, category, or type.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Practice questions retrieved successfully',
    resourceType: 'grammar-practice-question',
  })
  async getPracticeQuestions(
    @CurrentUser('id') userId: string,
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const level = queryParams.level as string | undefined;
    const category = queryParams.category as string | undefined;
    const type = queryParams.type as string | undefined;

    const result = await this.queryBus.execute(
      new GetPracticeQuestionsQuery(userId, { level, category, type })
    );

    const pagination = {
      page: parsedParams.page || 1,
      limit: parsedParams.limit || result.length || 20,
      total: result.length,
      totalPages: 1,
    };

    return createJsonApiPaginatedResponse(
      result,
      pagination.total,
      'grammar-practice-question',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: '1.0.0',
        message: 'Practice questions retrieved successfully',
      }
    );
  }

  @Post('daily-quiz/submit')
  @ApiOperation({
    summary: 'Nộp kết quả Daily Quiz hằng ngày',
    description: 'Submit answers for daily quiz and recalculate XP points.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Daily quiz result submitted successfully',
    resourceType: 'grammar-daily-quiz-submission',
  })
  async submitDailyQuiz(
    @Body() body: SubmitDailyQuizDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new SubmitDailyQuizCommand(userId, body));
    const selfLink = getBaseUrlFromRequest(req);
    return convertEntityToJsonApi(result, 'grammar-daily-quiz-submission', {
      selfLink,
      message: 'Daily quiz result submitted successfully',
      version: '1.0.0',
    });
  }

  @Post('graduation/:level/submit')
  @ApiOperation({
    summary: 'Nộp bài thi tốt nghiệp CEFR chặng cấp độ',
    description: 'Submit level graduation score and compute badge unlock/CEFR certificate eligibility.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Graduation exam submitted successfully',
    resourceType: 'grammar-graduation-submission',
  })
  async submitGraduationExam(
    @Param('level') level: string,
    @Body() body: SubmitGraduationExamDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new SubmitGraduationExamCommand(userId, level, body.percentage));
    const selfLink = getSelfLinkFromRequest(req, `${level}/submit`);
    return convertEntityToJsonApi(result, 'grammar-graduation-submission', {
      selfLink,
      message: 'Graduation exam submitted successfully',
      version: '1.0.0',
    });
  }

  // ============================================
  // GRAMMAR COMMUNITY HUB ENDPOINTS
  // ============================================

  @Get('community/posts')
  @ApiOperation({
    summary: 'Lấy các bài thảo luận cộng đồng chia sẻ mẹo ngữ pháp',
    description: 'List grammar tip discussion threads created by learners and teachers.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Community posts retrieved successfully',
    resourceType: 'grammar-community-post',
  })
  async getCommunityPosts(
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const tag = queryParams.tag as string | undefined;
    const search = (queryParams.search as string) || (queryParams.q as string) || undefined;

    const result = await this.queryBus.execute(new GetCommunityPostsQuery(tag, search));

    const pagination = {
      page: parsedParams.page || 1,
      limit: parsedParams.limit || result.length || 20,
      total: result.length,
      totalPages: 1,
    };

    return createJsonApiPaginatedResponse(
      result,
      pagination.total,
      'grammar-community-post',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: '1.0.0',
        message: 'Community posts retrieved successfully',
      }
    );
  }

  @Post('community/posts')
  @ApiOperation({
    summary: 'Tạo bài thảo luận cộng đồng mới',
    description: 'Create a community forum discussion post sharing tips or asking grammar questions.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Community post created successfully',
    resourceType: 'grammar-community-post',
  })
  async createCommunityPost(
    @Body() body: CreateCommunityPostDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new CreateCommunityPostCommand(userId, body));
    const selfLink = getSelfLinkFromRequest(req, result.id);
    return convertEntityToJsonApi(result, 'grammar-community-post', {
      selfLink,
      message: 'Community post created successfully',
      version: '1.0.0',
    });
  }

  @Post('community/posts/:id/comments')
  @ApiOperation({
    summary: 'Viết bình luận thảo luận dưới bài viết cộng đồng',
    description: 'Post a comment/reply under a specific community grammar thread.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Comment added successfully',
    resourceType: 'grammar-community-comment',
  })
  async addCommunityComment(
    @Param('id') postId: string,
    @Body() body: AddCommunityCommentDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new AddCommunityCommentCommand(userId, postId, body.content));
    const selfLink = getSelfLinkFromRequest(req, `${postId}/comments/${result.id}`);
    return convertEntityToJsonApi(result, 'grammar-community-comment', {
      selfLink,
      message: 'Comment added successfully',
      version: '1.0.0',
    });
  }

  @Post('community/posts/:id/like')
  @ApiOperation({
    summary: 'Thích bài viết cộng đồng',
    description: 'Upvote/like a grammar post.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Post liked successfully',
    resourceType: 'grammar-post-like',
  })
  async likeCommunityPost(@Param('id') postId: string, @Req() req: express.Request) {
    const result = await this.commandBus.execute(new LikeCommunityPostCommand(postId));
    const selfLink = getSelfLinkFromRequest(req, `${postId}/like`);
    return convertEntityToJsonApi(result, 'grammar-post-like', {
      selfLink,
      message: 'Post liked successfully',
      version: '1.0.0',
    });
  }

  // ============================================
  // CROWDSOURCED QUIZ ENDPOINTS
  // ============================================

  @Post('lessons/:id/crowdsourced')
  @ApiOperation({
    summary: 'Học viên đóng góp câu hỏi kiểm tra cho bài học',
    description: 'Submit a custom quiz question for a grammar lesson.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Quiz contributed successfully',
    resourceType: 'grammar-crowdsourced-quiz',
  })
  async submitCrowdsourcedQuiz(
    @Param('id') lessonId: string,
    @Body() body: SubmitCrowdsourcedQuizDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new SubmitCrowdsourcedQuizCommand(userId, lessonId, body));
    const selfLink = getSelfLinkFromRequest(req, `${lessonId}/crowdsourced/${result.id}`);
    return convertEntityToJsonApi(result, 'grammar-crowdsourced-quiz', {
      selfLink,
      message: 'Quiz contributed successfully',
      version: '1.0.0',
    });
  }

  @Post('quizzes/crowdsourced/:id/upvote')
  @ApiOperation({
    summary: 'Bình chọn/Upvote câu hỏi cộng đồng đóng góp',
    description: 'Upvote a contributed quiz question.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Quiz upvoted successfully',
    resourceType: 'grammar-quiz-upvote',
  })
  async upvoteCrowdsourcedQuiz(
    @Param('id') quizId: string,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new UpvoteCrowdsourcedQuizCommand(userId, quizId));
    const selfLink = getSelfLinkFromRequest(req, `${quizId}/upvote`);
    return convertEntityToJsonApi(result, 'grammar-quiz-upvote', {
      selfLink,
      message: 'Quiz upvoted successfully',
      version: '1.0.0',
    });
  }

  @Get('lessons/:id/crowdsourced')
  @ApiOperation({
    summary: 'Lấy kho câu hỏi do cộng đồng đóng góp và đã được duyệt của bài học',
    description: 'Retrieve approved crowdsourced quiz questions for a grammar lesson.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Crowdsourced quizzes retrieved successfully',
    resourceType: 'grammar-crowdsourced-quiz',
  })
  async getCrowdsourcedQuizzes(
    @Param('id') lessonId: string,
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const result = await this.queryBus.execute(new GetCrowdsourcedQuizzesQuery(lessonId));

    const pagination = {
      page: parsedParams.page || 1,
      limit: parsedParams.limit || result.length || 20,
      total: result.length,
      totalPages: 1,
    };

    return createJsonApiPaginatedResponse(
      result,
      pagination.total,
      'grammar-crowdsourced-quiz',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: '1.0.0',
        message: 'Crowdsourced quizzes retrieved successfully',
      }
    );
  }

  // ============================================
  // SPACED REPETITION PRACTICE ENDPOINTS
  // ============================================

  @Get('practice/srs')
  @ApiOperation({
    summary: 'Lấy các câu hỏi ôn tập thông minh đến hạn (SRS)',
    description: 'Retrieve due grammar flashcard/practice items utilizing SM-2 interval scheduling.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'SRS due questions retrieved successfully',
    resourceType: 'grammar-srs-quiz',
  })
  async getSrsDueQuizzes(
    @CurrentUser('id') userId: string,
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const result = await this.queryBus.execute(new GetSrsDueQuizzesQuery(userId));

    const pagination = {
      page: parsedParams.page || 1,
      limit: parsedParams.limit || result.length || 20,
      total: result.length,
      totalPages: 1,
    };

    return createJsonApiPaginatedResponse(
      result,
      pagination.total,
      'grammar-srs-quiz',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: '1.0.0',
        message: 'SRS due questions retrieved successfully',
      }
    );
  }

  @Post('practice/srs/:id/submit')
  @ApiOperation({
    summary: 'Nộp kết quả câu hỏi ôn tập và tính toán lịch SuperMemo-2 tiếp theo',
    description: 'Submit answers for SRS quiz and updates learning stats (repetition, easy factor, next interval).',
  })
  @ApiJsonApiSuccessResponse({
    description: 'SRS feedback processed successfully',
    resourceType: 'grammar-srs-feedback',
  })
  async submitSrsFeedback(
    @Param('id') quizId: string,
    @Body() body: SubmitSrsFeedbackDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new SubmitSrsFeedbackCommand(userId, quizId, body.isCorrect));
    const selfLink = getSelfLinkFromRequest(req, `${quizId}/submit`);
    return convertEntityToJsonApi(result, 'grammar-srs-feedback', {
      selfLink,
      message: 'SRS feedback processed successfully',
      version: '1.0.0',
    });
  }

  // ============================================
  // CROWDSOURCED PRACTICE EXAM SETS (PHASE 6)
  // ============================================

  @Get('exams')
  @ApiOperation({
    summary: 'Lấy danh sách bộ đề thi thử',
    description: 'Retrieve grammar mock exams filtered by level, standard types (CEFR, TOEIC, IELTS), and title keyword.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Exam sets retrieved successfully',
    resourceType: 'grammar-exam-set',
  })
  async getExamSets(
    @CurrentUser('id') userId: string,
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const level = queryParams.level as string | undefined;
    const examType = queryParams.type as string | undefined;
    const search = (queryParams.search as string) || (queryParams.q as string) || undefined;

    const result = await this.queryBus.execute(new GetExamSetsQuery(userId, { level, examType, search }));

    const pagination = {
      page: parsedParams.page || 1,
      limit: parsedParams.limit || result.length || 20,
      total: result.length,
      totalPages: 1,
    };

    return createJsonApiPaginatedResponse(
      result,
      pagination.total,
      'grammar-exam-set',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: '1.0.0',
        message: 'Exam sets retrieved successfully',
      }
    );
  }

  @Post('exams')
  @UseGuards(PermissionsGuard)
  @Permissions('write:admin')
  @ApiOperation({
    summary: 'Đóng góp bộ đề thi thử ngữ pháp mới',
    description: 'Submit a new mock test set containing graded grammar questions. Admin access required.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Exam set created successfully',
    resourceType: 'grammar-exam-set',
  })
  async createExamSet(
    @Body() body: CreateExamSetDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new CreateExamSetCommand(userId, 'Học viên ưu tú', body));
    const selfLink = getSelfLinkFromRequest(req, result.id);
    return convertEntityToJsonApi(result, 'grammar-exam-set', {
      selfLink,
      message: 'Exam set created successfully',
      version: '1.0.0',
    });
  }

  @Post('exams/:id/upvote')
  @ApiOperation({
    summary: 'Bình chọn/Upvote bộ đề thi cộng đồng',
    description: 'Upvote a contributed mock exam set.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Exam set upvoted successfully',
    resourceType: 'grammar-exam-upvote',
  })
  async upvoteExamSet(@Param('id') id: string, @Req() req: express.Request) {
    const result = await this.commandBus.execute(new UpvoteExamSetCommand(id));
    const selfLink = getSelfLinkFromRequest(req, `${id}/upvote`);
    return convertEntityToJsonApi(result, 'grammar-exam-upvote', {
      selfLink,
      message: 'Exam set upvoted successfully',
      version: '1.0.0',
    });
  }

  @Post('exams/:id/submit')
  @ApiOperation({
    summary: 'Nộp kết quả thi thử bộ đề và tính toán cấp chứng chỉ',
    description: 'Submit answers for a mock exam set, and generate user certs if score threshold is met.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Exam attempt submitted successfully',
    resourceType: 'grammar-exam-attempt',
  })
  async submitExamAttempt(
    @Param('id') id: string,
    @Body() body: SubmitExamAttemptDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new SubmitExamAttemptCommand(userId, id, body.correctCount, body.totalCount));
    const selfLink = getSelfLinkFromRequest(req, `${id}/submit`);
    return convertEntityToJsonApi(result, 'grammar-exam-attempt', {
      selfLink,
      message: 'Exam attempt submitted successfully',
      version: '1.0.0',
    });
  }

  @Get('exams/certificates')
  @ApiOperation({
    summary: 'Lấy các chứng chỉ tốt nghiệp ngữ pháp đã được cấp',
    description: 'Retrieve all academic certificates earned by the current user.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'User certificates retrieved successfully',
    resourceType: 'grammar-certificate',
  })
  async getUserCertificates(
    @CurrentUser('id') userId: string,
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const result = await this.queryBus.execute(new GetUserCertificatesQuery(userId));

    const pagination = {
      page: parsedParams.page || 1,
      limit: parsedParams.limit || result.length || 20,
      total: result.length,
      totalPages: 1,
    };

    return createJsonApiPaginatedResponse(
      result,
      pagination.total,
      'grammar-certificate',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: '1.0.0',
        message: 'User certificates retrieved successfully',
      }
    );
  }

  // ============================================
  // GRAMMAR TRAP DIARY ENDPOINTS (PHASE 7)
  // ============================================

  @Post('trap-diary')
  @ApiOperation({
    summary: 'Lưu bẫy ngữ pháp lỗi làm sai của học viên',
    description: 'Save incorrect question detail to the student’s personalized grammar trap diary for future reference and SRS.',
  })
  @ApiJsonApiCreatedResponse({
    description: 'Grammar mistake trap saved successfully',
    resourceType: 'grammar-trap',
  })
  async saveGrammarTrap(
    @Body() body: SaveGrammarTrapDto,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new SaveGrammarTrapCommand(userId, body));
    const selfLink = getSelfLinkFromRequest(req, result.id);
    return convertEntityToJsonApi(result, 'grammar-trap', {
      selfLink,
      message: 'Grammar mistake trap saved successfully',
      version: '1.0.0',
    });
  }

  @Get('trap-diary')
  @ApiOperation({
    summary: 'Lấy danh sách bẫy ngữ pháp của người dùng',
    description: 'Retrieve the student’s custom trap diary items, optionally filtering by active/broken status.',
  })
  @ApiJsonApiPaginatedResponse({
    description: 'Trap diary retrieved successfully',
    resourceType: 'grammar-trap',
  })
  async getTrapDiary(
    @CurrentUser('id') userId: string,
    @Query() queryParams: Record<string, unknown>,
    @Req() req: express.Request
  ) {
    const parsedParams = createQueryParamsFromObject(queryParams);
    const status = queryParams.status as string | undefined;

    const result = await this.queryBus.execute(new GetGrammarTrapsQuery(userId, status));

    const pagination = {
      page: parsedParams.page || 1,
      limit: parsedParams.limit || result.length || 20,
      total: result.length,
      totalPages: 1,
    };

    return createJsonApiPaginatedResponse(
      result,
      pagination.total,
      'grammar-trap',
      getBaseUrlFromRequest(req),
      pagination,
      {
        version: '1.0.0',
        message: 'Trap diary retrieved successfully',
      }
    );
  }

  @Post('trap-diary/:id/break')
  @UseGuards(GrammarAbilitiesGuard)
  @ApiOperation({
    summary: 'Đánh dấu bẫy đã được phá thành công',
    description: 'Mark a specific grammar mistake trap as broken (solved/learnt).',
  })
  @ApiJsonApiSuccessResponse({
    description: 'Grammar trap marked as broken successfully',
    resourceType: 'grammar-trap',
  })
  async breakGrammarTrap(
    @Param('id') trapId: string,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new BreakGrammarTrapCommand(userId, trapId));
    const selfLink = getSelfLinkFromRequest(req, `${trapId}/break`);
    return convertEntityToJsonApi(result, 'grammar-trap', {
      selfLink,
      message: 'Grammar trap marked as broken successfully',
      version: '1.0.0',
    });
  }

  @Post('trap-diary/:id/ai-analysis')
  @UseGuards(GrammarAbilitiesGuard)
  @ApiOperation({
    summary: 'Yêu cầu Trợ lý AI giải mã bẫy lỗi sai',
    description: 'Request detailed AI explanations and suggestions for how to avoid a specific mistake trap.',
  })
  @ApiJsonApiSuccessResponse({
    description: 'AI analysis generated successfully',
    resourceType: 'grammar-trap-analysis',
  })
  async generateAiTrapAnalysis(
    @Param('id') trapId: string,
    @CurrentUser('id') userId: string,
    @Req() req: express.Request
  ) {
    const result = await this.commandBus.execute(new GenerateAiTrapAnalysisCommand(userId, trapId));
    const selfLink = getSelfLinkFromRequest(req, `${trapId}/ai-analysis`);
    return convertEntityToJsonApi(result, 'grammar-trap-analysis', {
      selfLink,
      message: 'AI analysis generated successfully',
      version: '1.0.0',
    });
  }
}

