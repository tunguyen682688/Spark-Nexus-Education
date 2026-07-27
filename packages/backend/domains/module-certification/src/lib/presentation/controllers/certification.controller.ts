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
  GetQuestionBuilderQuery,
  GetQuestionHistoryQuery,
} from '../../application/queries';

import { StartExamSessionDto } from '../../application/dtos/start-exam-session.dto';
import { SaveSessionAnswerDto } from '../../application/dtos/save-session-answer.dto';
import { RecordSessionViolationDto } from '../../application/dtos/record-session-violation.dto';
import { CreateCollectionReviewDto } from '../../application/dtos/create-collection-review.dto';
import { CreateCollectionDiscussionDto } from '../../application/dtos/create-collection-discussion.dto';
import { ReportCollectionDto } from '../../application/dtos/report-collection.dto';
import { SaveQuestionDto } from '../../application/dtos/save-question.dto';
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
  SaveQuestionCommand,
  DeleteQuestionCommand,
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

    const data = {
      id: `creator-${user.id}`,
      creatorName: user.name || user.email || 'Minh Anh',
      role: 'Creator',
      metrics: {
        totalExams: 23,
        totalExamsWeeklyChange: '+3 this week',
        totalQuestions: 1248,
        totalQuestionsWeeklyChange: '+86 this week',
        totalAttempts: 12856,
        totalAttemptsWeeklyChange: '+1,234 this week',
        averageScore: '72.6%',
        averageScoreWeeklyChange: '+4.8% vs last week',
        likesReceived: 532,
        likesReceivedWeeklyChange: '+48 this week',
      },
      performanceChart: {
        timeframe: 'Last 7 Days',
        dates: ['May 10', 'May 11', 'May 12', 'May 13', 'May 14', 'May 15', 'May 16'],
        attempts: [1234, 1564, 1876, 2034, 1812, 2146, 2190],
        averageScores: [70.2, 71.5, 72.0, 72.8, 71.9, 73.1, 72.6],
        likes: [45, 62, 78, 85, 70, 92, 100],
        revenue: [40, 65, 80, 110, 75, 125, 130],
      },
      recentActivity: [
        {
          id: 'act-1',
          type: 'publish',
          title: 'You published "TOEIC Full Test 10 (2024)"',
          timestamp: 'May 16, 2024 10:15 AM',
          iconType: 'check',
          iconBgClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
        },
        {
          id: 'act-2',
          type: 'update',
          title: 'You updated 15 questions in "Part 7: Reading"',
          timestamp: 'May 15, 2024 03:42 PM',
          iconType: 'document',
          iconBgClass: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
        },
        {
          id: 'act-3',
          type: 'like',
          title: 'Your exam "Daily Grammar Quiz #12" got 48 likes',
          timestamp: 'May 15, 2024 11:20 AM',
          iconType: 'star',
          iconBgClass: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
        },
        {
          id: 'act-4',
          type: 'comment',
          title: 'New comment on "Business Vocabulary Set 3"',
          timestamp: 'May 14, 2024 09:18 PM',
          iconType: 'comment',
          iconBgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
        },
        {
          id: 'act-5',
          type: 'like',
          title: 'Your exam "Listening Practice Set 5" got 32 likes',
          timestamp: 'May 14, 2024 04:05 PM',
          iconType: 'heart',
          iconBgClass: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
        },
      ],
      topExams: [
        {
          rank: 1,
          id: 'toeic-10',
          title: 'TOEIC Full Test 10 (2024)',
          category: 'Full Test',
          categoryBadge: 'TOEIC',
          categoryBadgeClass: 'bg-blue-600 text-white',
          attempts: 2934,
          avgScore: '78.4%',
          likes: 128,
        },
        {
          rank: 2,
          id: 'reading-7',
          title: 'Reading Practice Set 7',
          category: 'Reading',
          categoryBadge: 'READING',
          categoryBadgeClass: 'bg-teal-600 text-white',
          attempts: 1987,
          avgScore: '71.2%',
          likes: 96,
        },
        {
          rank: 3,
          id: 'listening-5',
          title: 'Listening Practice Set 5',
          category: 'Listening',
          categoryBadge: 'LISTENING',
          categoryBadgeClass: 'bg-indigo-600 text-white',
          attempts: 1652,
          avgScore: '69.1%',
          likes: 84,
        },
        {
          rank: 4,
          id: 'grammar-3',
          title: 'Grammar Quiz - Advanced #3',
          category: 'Grammar',
          categoryBadge: 'GRAMMAR',
          categoryBadgeClass: 'bg-emerald-600 text-white',
          attempts: 1243,
          avgScore: '74.8%',
          likes: 67,
        },
        {
          rank: 5,
          id: 'vocab-3',
          title: 'Business Vocabulary Set 3',
          category: 'Vocabulary',
          categoryBadge: 'VOCAB',
          categoryBadgeClass: 'bg-rose-600 text-white',
          attempts: 1102,
          avgScore: '68.3%',
          likes: 55,
        },
      ],
      revenue: {
        totalRevenue: '$452.60',
        revenueGrowth: '+12.6% vs last month',
        payoutBalance: '$186.30',
        dailyData: [
          { day: 'May 1', amount: 20 },
          { day: 'May 2', amount: 45 },
          { day: 'May 3', amount: 35 },
          { day: 'May 4', amount: 60 },
          { day: 'May 5', amount: 40 },
          { day: 'May 6', amount: 75 },
          { day: 'May 7', amount: 50 },
          { day: 'May 8', amount: 90 },
          { day: 'May 9', amount: 110 },
          { day: 'May 10', amount: 65 },
          { day: 'May 11', amount: 70 },
          { day: 'May 12', amount: 85 },
          { day: 'May 13', amount: 40 },
          { day: 'May 14', amount: 95 },
          { day: 'May 15', amount: 120 },
          { day: 'May 16', amount: 105 },
        ],
      },
    };

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
    const data = {
      id: id || 'toeic-mastery-collection',
      status: 'Draft',
      lastAutosaved: '2m ago',
      details: {
        title: 'TOEIC Mastery Collection',
        subtitle: 'Comprehensive practice to master all TOEIC skills',
        description:
          'A complete collection of TOEIC practice tests covering all parts and skill levels. Perfect for learners who want to improve step by step and achieve a high score.',
        level: 'Beginner to Advanced',
        tags: ['TOEIC', 'Practice', 'Listening', 'Reading'],
        visibility: 'Public',
        allowDownloads: true,
        coverImage:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
        createdDate: 'May 10, 2024 10:15 AM',
        lastUpdatedDate: 'May 16, 2024 02:45 PM',
      },
      chapters: [
        {
          id: 'chap-1',
          number: 1,
          title: 'Part 1: Getting Started',
          description:
            'Build a strong foundation with essential topics and easy-to-medium level exams.',
          examCount: 3,
          exams: [
            {
              id: 'exam-1',
              number: 1,
              title: 'TOEIC Practice Test 1',
              subTitle: 'Basic Concepts',
              questionsCount: 60,
              durationMinutes: 60,
              difficulty: 'Easy',
              status: 'Published',
              iconType: 'toeic',
            },
            {
              id: 'exam-2',
              number: 2,
              title: 'TOEIC Practice Test 2',
              subTitle: 'Daily Training',
              questionsCount: 60,
              durationMinutes: 60,
              difficulty: 'Easy',
              status: 'Published',
              iconType: 'toeic',
            },
            {
              id: 'exam-3',
              number: 3,
              title: 'TOEIC Practice Test 3',
              subTitle: 'Vocabulary Focus',
              questionsCount: 60,
              durationMinutes: 60,
              difficulty: 'Medium',
              status: 'Draft',
              iconType: 'toeic',
            },
          ],
        },
        {
          id: 'chap-2',
          number: 2,
          title: 'Part 2: Building Skills',
          description:
            'Enhance your test-taking strategies with targeted skill-building tests.',
          examCount: 4,
          exams: [],
        },
        {
          id: 'chap-3',
          number: 3,
          title: 'Part 3: Improving Accuracy',
          description: 'Master tough question patterns and avoid common traps.',
          examCount: 4,
          exams: [],
        },
        {
          id: 'chap-4',
          number: 4,
          title: 'Part 4: Advanced Practice',
          description: 'Simulate high-pressure exam environments.',
          examCount: 5,
          exams: [],
        },
        {
          id: 'chap-5',
          number: 5,
          title: 'Full Length Tests',
          description: 'Full 2-hour 200 question mock examinations.',
          examCount: 6,
          exams: [],
        },
      ],
      summary: {
        totalChapters: 5,
        totalExams: 22,
        totalQuestions: 1320,
        estimatedDurationHours: 22,
        estimatedDurationMinutes: 0,
        difficultyMix: {
          easy: 45,
          medium: 40,
          hard: 15,
        },
      },
    };

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
    const data = {
      id: id || 'toeic-practice-test-1',
      status: 'Draft',
      lastAutosaved: 'All changes saved',
      settings: {
        title: 'TOEIC Practice Test 1',
        description:
          'A full-length TOEIC practice test for learners aiming to improve their listening, reading, speaking and writing skills.',
        level: 'Intermediate',
        language: 'English',
        passingScore: 550,
        maxScore: 990,
        createdDate: 'May 10, 2024 10:15 AM',
        lastUpdatedDate: 'May 16, 2024 02:45 PM',
      },
      sections: [
        {
          id: 'sec-1',
          number: 1,
          title: 'Listening',
          subtitle: 'Part 1 - 4',
          questionCount: 100,
          durationMinutes: 45,
          isBreak: false,
          questions: [
            {
              id: 'q-1',
              number: 1,
              title: 'Look at the picture and choose the best description.',
              partTag: 'Part 1',
              type: 'Single Choice',
              difficulty: 'Easy',
              points: 1,
              imageUrl:
                'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop',
            },
            {
              id: 'q-2',
              number: 2,
              title: 'Listen and choose the correct response.',
              partTag: 'Part 2',
              type: 'Single Choice',
              difficulty: 'Easy',
              points: 1,
              imageUrl:
                'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=150&auto=format&fit=crop',
            },
            {
              id: 'q-3',
              number: 3,
              title: 'Listen to the conversation. What is the man asking about?',
              partTag: 'Part 3',
              type: 'Multiple Choice',
              difficulty: 'Medium',
              points: 1,
              imageUrl:
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop',
            },
            {
              id: 'q-4',
              number: 4,
              title: 'Listen to the talk. What is the purpose of the talk?',
              partTag: 'Part 4',
              type: 'Multiple Choice',
              difficulty: 'Medium',
              points: 1,
              imageUrl:
                'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&auto=format&fit=crop',
            },
            {
              id: 'q-5',
              number: 5,
              title: 'Which word is closest in meaning to "essential"?',
              partTag: 'Part 5',
              type: 'Single Choice',
              difficulty: 'Hard',
              points: 1,
              imageUrl: null,
            },
          ],
        },
        {
          id: 'sec-2',
          number: 2,
          title: 'Reading',
          subtitle: 'Part 5 - 6',
          questionCount: 100,
          durationMinutes: 75,
          isBreak: false,
          questions: [],
        },
        {
          id: 'sec-3',
          number: 3,
          title: 'Break',
          subtitle: '10 minutes',
          questionCount: 0,
          durationMinutes: 10,
          isBreak: true,
          questions: [],
        },
        {
          id: 'sec-4',
          number: 4,
          title: 'Speaking',
          subtitle: 'Part 1 - 7',
          questionCount: 11,
          durationMinutes: 20,
          isBreak: false,
          questions: [],
        },
        {
          id: 'sec-5',
          number: 5,
          title: 'Writing',
          subtitle: 'Part 1 - 2',
          questionCount: 9,
          durationMinutes: 35,
          isBreak: false,
          questions: [],
        },
      ],
      blueprint: {
        totalQuestions: 220,
        totalTimeMinutes: 135,
        totalPoints: 220,
      },
    };

    return convertEntityToJsonApi(data, 'exam-builder', {
      selfLink: getSelfLinkFromRequest(req, `exams/${id}/builder`),
      message: 'Exam builder details retrieved successfully',
      version: '1.0.0',
    });
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

    return convertEntityToJsonApi(versions, 'question-history', {
      selfLink: getSelfLinkFromRequest(req, `questions/${id}/history`),
      message: 'Question history retrieved successfully',
      version: '1.0.0',
    });
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

    const response = convertEntityToJsonApi(
      {
        id: `history-${user.id}`,
        userId: user.id,
        totalSessions: 6,
        items: [
          {
            id: 'IELTS-FULL-001',
            code: 'ID: IELTS-FULL-001',
            title: 'IELTS Academic Full Test 1',
            type: 'Mock Test',
            typeBadgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
            iconBgClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
            iconType: 'document',
            examPart: 'Full Listening, Reading, Writing',
            scoreDisplay: '7.5',
            scoreSub: 'Listening: 8.0 • Reading: 7.5',
            scoreColor: 'text-indigo-600 dark:text-indigo-400',
            timeSpent: '2h 45m',
            dateDisplay: 'May 20, 2025 09:30 AM',
          },
          {
            id: 'TOEIC-READ-088',
            code: 'ID: TOEIC-READ-088',
            title: 'TOEIC Reading Part 7 Practice',
            type: 'Practice by Part',
            typeBadgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
            iconBgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
            iconType: 'document',
            examPart: 'TOEIC Reading',
            scoreDisplay: '450/490',
            scoreSub: '48/54 correct',
            scoreColor: 'text-emerald-600 dark:text-emerald-400',
            timeSpent: '55m',
            dateDisplay: 'May 19, 2025 03:15 PM',
          },
          {
            id: 'VOCAB-QUIZ-102',
            code: 'ID: VOCAB-QUIZ-102',
            title: 'Vocabulary Daily Quiz #14',
            type: 'Quiz',
            typeBadgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
            iconBgClass: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
            iconType: 'sparkles',
            examPart: 'Essential Vocabulary',
            scoreDisplay: '100%',
            scoreSub: '20/20 correct',
            scoreColor: 'text-emerald-600 dark:text-emerald-400',
            timeSpent: '08m',
            dateDisplay: 'May 18, 2025 11:00 AM',
          },
          {
            id: 'VSTEP-B2-MOCK3',
            code: 'ID: VSTEP-B2-MOCK3',
            title: 'VSTEP B2 Preparation Mock Test 3',
            type: 'Mock Test',
            typeBadgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
            iconBgClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
            iconType: 'document',
            examPart: 'Cambridge B2',
            scoreDisplay: '68%',
            scoreSub: '27/40',
            scoreColor: 'text-amber-600 dark:text-amber-400',
            timeSpent: '48m',
            dateDisplay: 'May 17, 2025 06:30 PM',
          },
          {
            id: 'IELTS-SP-P2-023',
            code: 'ID: IELTS-SP-P2-023',
            title: 'IELTS Speaking Part 2',
            type: 'AI Practice',
            typeBadgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
            iconBgClass: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
            iconType: 'mic',
            examPart: 'IELTS Speaking',
            scoreDisplay: '6.5',
            scoreSub: 'Fair',
            scoreColor: 'text-amber-600 dark:text-amber-400',
            timeSpent: '24m',
            dateDisplay: 'May 17, 2025 10:15 AM',
          },
          {
            id: 'TOEIC-LIS-P1-001',
            code: 'ID: TOEIC-LIS-P1-001',
            title: 'TOEIC Listening Part 1 & 2',
            type: 'Practice by Part',
            typeBadgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
            iconBgClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
            iconType: 'headphones',
            examPart: 'TOEIC Listening',
            scoreDisplay: '80%',
            scoreSub: '32/40',
            scoreColor: 'text-emerald-600 dark:text-emerald-400',
            timeSpent: '28m',
            dateDisplay: 'May 16, 2025 08:50 PM',
          },
        ],
      },
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

    const response = convertEntityToJsonApi(
      {
        id: `completed-${user.id}`,
        userId: user.id,
        totalCompleted: 3,
        items: [
          {
            id: 'comp-1',
            title: 'IELTS Cambridge 18 - Full Academic Test Collection',
            category: 'Full Mock Test',
            examType: 'IELTS Academic',
            completedDate: 'May 18, 2025',
            scoreText: 'Band 7.5 Overall',
            iconBgClass: 'bg-indigo-600 text-white',
            coverGradient: 'from-indigo-600 to-purple-700 text-white',
            totalItems: 4,
            certificateEligible: true,
          },
          {
            id: 'comp-2',
            title: 'TOEIC ETS 2024 Practice Tests 1-5',
            category: 'Practice Bundle',
            examType: 'TOEIC L&R',
            completedDate: 'May 14, 2025',
            scoreText: '880 / 990 PTS',
            iconBgClass: 'bg-blue-600 text-white',
            coverGradient: 'from-blue-600 to-sky-700 text-white',
            totalItems: 5,
            certificateEligible: true,
          },
          {
            id: 'comp-3',
            title: 'VSTEP B2 Reading & Listening Practice Collection',
            category: 'Skill Drills',
            examType: 'VSTEP',
            completedDate: 'May 10, 2025',
            scoreText: 'Passed B2 Standard',
            iconBgClass: 'bg-emerald-600 text-white',
            coverGradient: 'from-emerald-600 to-teal-700 text-white',
            totalItems: 10,
            certificateEligible: false,
          },
        ],
      },
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

    const response = convertEntityToJsonApi(
      {
        id: `favorites-${user.id}`,
        userId: user.id,
        totalFavorites: 4,
        items: [
          {
            id: 'fav-1',
            title: 'IELTS Academic Full Mock Exam 2025',
            type: 'Collection',
            itemCountText: 'Collection • 45 items',
            progressPercent: 75,
            progressText: '75% Completed',
            progressBarClass: 'bg-indigo-500',
            stat1Label: 'Est. Band',
            stat1Value: '7.5',
            stat2Label: 'Learners',
            stat2Value: '14.2K',
            addedDate: 'May 20, 2025',
            iconType: 'ielts',
            bannerBgClass: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600',
            isFavorited: true,
          },
          {
            id: 'fav-2',
            title: 'TOEIC Listening Part 3 & 4 Masterclass',
            type: 'Test',
            itemCountText: 'Test • 100 questions',
            progressPercent: 50,
            progressText: '50% Completed',
            progressBarClass: 'bg-purple-500',
            stat1Label: 'Target',
            stat1Value: '900+',
            stat2Label: 'Time',
            stat2Value: '45 min',
            addedDate: 'May 18, 2025',
            iconType: 'toeic',
            bannerBgClass: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600',
            isFavorited: true,
          },
          {
            id: 'fav-3',
            title: 'IELTS Reading - True/False/Not Given Drills',
            type: 'Question Set',
            itemCountText: 'Question Set • 30 questions',
            progressPercent: 90,
            progressText: '90% Completed',
            progressBarClass: 'bg-indigo-500',
            stat1Label: 'Accuracy',
            stat1Value: '88%',
            stat2Label: 'Avg Time',
            stat2Value: '12 min',
            addedDate: 'May 17, 2025',
            iconType: 'reading',
            bannerBgClass: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600',
            isFavorited: true,
          },
          {
            id: 'fav-4',
            title: 'TOEIC Essential 600 Vocabulary Package',
            type: 'Vocabulary Set',
            itemCountText: 'Vocabulary • 600 words',
            progressPercent: 100,
            progressText: '100% Learned',
            progressBarClass: 'bg-emerald-500',
            stat1Label: 'Mastery',
            stat1Value: '92%',
            stat2Label: 'Words',
            stat2Value: '600',
            addedDate: 'May 16, 2025',
            iconType: 'vocabulary',
            bannerBgClass: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600',
            isFavorited: true,
          },
        ],
      },
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

    const response = convertEntityToJsonApi(
      {
        id: `bookmarks-${user.id}`,
        userId: user.id,
        totalBookmarks: 2,
        items: [
          {
            id: 'bm-1',
            title: 'IELTS Reading Section 3 - True/False/Not Given',
            type: 'Question',
            folder: 'IELTS Reading',
            savedDate: 'May 20, 2025',
            notes: 'Remember to check key synonyms in passage paragraph C',
          },
          {
            id: 'bm-2',
            title: 'TOEIC Part 5 - Advanced Inversion Grammar Rule',
            type: 'Grammar Rule',
            folder: 'Grammar Notes',
            savedDate: 'May 18, 2025',
            notes: 'Scarcely had... when... structure',
          },
        ],
      },
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

    const response = convertEntityToJsonApi(
      {
        id: `downloads-${user.id}`,
        userId: user.id,
        totalDownloads: 4,
        items: [
          {
            id: 'dl-1',
            name: 'IELTS Cambridge 18 - Full Mock 1',
            subtitle: 'Practice Test PDF',
            fileFormat: 'PDF',
            fileFormatBadgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
            fileIconBgClass: 'bg-indigo-600 text-white',
            downloadedOn: 'May 20, 2025 04:30 PM',
            size: '8.4 MB',
            expiresOn: 'May 20, 2026',
            category: 'Tests',
          },
          {
            id: 'dl-2',
            name: 'TOEIC Economy Vol 5 - Test 3 Audio',
            subtitle: 'Audio Files Bundle',
            fileFormat: 'MP3',
            fileFormatBadgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
            fileIconBgClass: 'bg-purple-600 text-white',
            downloadedOn: 'May 19, 2025 09:15 AM',
            size: '42.1 MB',
            expiresOn: 'May 19, 2026',
            category: 'Tests',
          },
          {
            id: 'dl-3',
            name: 'Academic Vocabulary 1000 Words List',
            subtitle: 'Vocabulary Flashcards',
            fileFormat: 'DOCX',
            fileFormatBadgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
            fileIconBgClass: 'bg-blue-600 text-white',
            downloadedOn: 'May 18, 2025 02:00 PM',
            size: '2.3 MB',
            expiresOn: 'May 18, 2026',
            category: 'Vocabulary',
          },
          {
            id: 'dl-4',
            name: 'IELTS Band 8.0 Scorecard Report',
            subtitle: 'Official Analytics Report',
            fileFormat: 'PDF',
            fileFormatBadgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
            fileIconBgClass: 'bg-emerald-600 text-white',
            downloadedOn: 'May 17, 2025 11:45 AM',
            size: '1.2 MB',
            expiresOn: 'Lifetime',
            category: 'Reports',
          },
        ],
      },
      'certification-downloads',
      {
        selfLink: getSelfLinkFromRequest(req, 'downloads'),
        message: 'Downloads retrieved successfully',
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

    const response = convertEntityToJsonApi(
      {
        id: `purchased-${user.id}`,
        userId: user.id,
        totalPurchased: 3,
        items: [
          {
            id: 'pur-1',
            orderId: 'ORD-9821',
            title: 'IELTS Official Cambridge 15-18 Full Master Package',
            category: 'Official Bundles',
            examType: 'IELTS Academic',
            coverGradient: 'from-indigo-600 to-purple-700 text-white',
            pricePaid: '$49.00',
            purchaseDate: 'May 10, 2025',
            accessType: 'Lifetime Access',
            completedTests: 12,
            totalTests: 16,
            progressPercent: 75,
          },
          {
            id: 'pur-2',
            orderId: 'ORD-8742',
            title: 'TOEIC ETS 2024 Ultimate Target 900+ Vault',
            category: 'TOEIC Master',
            examType: 'TOEIC L&R',
            coverGradient: 'from-blue-600 to-sky-700 text-white',
            pricePaid: '$39.00',
            purchaseDate: 'Apr 28, 2025',
            accessType: 'Lifetime Access',
            completedTests: 8,
            totalTests: 10,
            progressPercent: 80,
          },
          {
            id: 'pur-3',
            orderId: 'ORD-7612',
            title: 'IELTS Writing Task 1 & 2 Band 8.0 Model Essays',
            category: 'IELTS Pro',
            examType: 'IELTS Writing',
            coverGradient: 'from-purple-600 to-pink-700 text-white',
            pricePaid: '$29.00',
            purchaseDate: 'Apr 15, 2025',
            accessType: '1-Year License',
            completedTests: 25,
            totalTests: 25,
            progressPercent: 100,
          },
        ],
      },
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
