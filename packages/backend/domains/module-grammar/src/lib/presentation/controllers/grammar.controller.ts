import { Controller, Get, Param, Post, Put, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard, CurrentUser, PermissionsGuard, Permissions } from '@spark-nest-ed/infrastructure-auth';

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
@Controller('grammar')
export class GrammarController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus 
  ) {}

  @Get('leaderboard')
  async getLeaderboard(@Query('timeframe') timeframe?: 'week' | 'month' | 'all-time') {
    return this.queryBus.execute(new GetLeaderboardQuery(timeframe));
  }

  @Get('roadmap')
  @ApiOperation({ summary: 'Lấy lộ trình học ngữ pháp toàn diện' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu lộ trình thành công' })
  async getRoadmap(@CurrentUser('id') userId: string) {
    return this.queryBus.execute(new GetRoadmapQuery(userId));
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Lấy dữ liệu phân tích năng lực ngữ pháp nâng cao' })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu phân tích thành công' })
  async getAnalyticsSummary(@CurrentUser('id') userId: string) {
    return this.queryBus.execute(new GetAnalyticsSummaryQuery(userId));
  }

  @Get('lessons/:id')
  @ApiOperation({ summary: 'Lấy chi tiết một bài học ngữ pháp' })
  async getLessonDetail(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.queryBus.execute(new GetLessonDetailQuery(id, userId));
  }

  @Post('lessons')
  @UseGuards(PermissionsGuard)
  @Permissions('write:admin')
  @ApiOperation({ summary: 'Tạo bài học ngữ pháp mới' })
  @ApiResponse({ status: 201, description: 'Tạo bài học thành công' })
  async createLesson(@Body() body: CreateLessonDto) {
    return this.commandBus.execute(new CreateLessonCommand(body));
  }

  @Put('lessons/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('write:admin')
  @ApiOperation({ summary: 'Cập nhật bài học ngữ pháp' })
  @ApiResponse({ status: 200, description: 'Cập nhật bài học thành công' })
  async updateLesson(@Param('id') id: string, @Body() body: UpdateLessonDto) {
    return this.commandBus.execute(new UpdateLessonCommand(id, body));
  }

  @Post('lessons/:id/complete')
  @ApiOperation({ summary: 'Hoàn thành bài học ngữ pháp' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái hoàn thành thành công' })
  async completeLesson(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.commandBus.execute(new CompleteLessonCommand(id, userId));
  }

  @Put('lessons/:id/progress')
  @ApiOperation({ summary: 'Cập nhật ghi chú nhanh hoặc tiến trình học tập' })
  @ApiResponse({ status: 200, description: 'Cập nhật tiến trình thành công' })
  async updateProgress(@Param('id') id: string, @Body() body: UpdateProgressDto, @CurrentUser('id') userId: string) {
    return this.commandBus.execute(new UpdateLessonProgressCommand(id, userId, body));
  }

  @Get('daily-quiz')
  @ApiOperation({ summary: 'Lấy câu hỏi Daily Quiz ngẫu nhiên hằng ngày' })
  async getDailyQuiz() {
    return this.queryBus.execute(new GetDailyQuizQuery());
  }

  @Get('practice/questions')
  @ApiOperation({ summary: 'Lấy câu hỏi thực hành ngữ pháp nâng cao đa dạng' })
  async getPracticeQuestions(
    @CurrentUser('id') userId: string,
    @Query('level') level?: string,
    @Query('category') category?: string,
    @Query('type') type?: string
  ) {
    return this.queryBus.execute(
      new GetPracticeQuestionsQuery(userId, {
        level,
        category,
        type,
      })
    );
  }

  @Post('daily-quiz/submit')
  @ApiOperation({ summary: 'Nộp kết quả Daily Quiz hằng ngày' })
  async submitDailyQuiz(@Body() body: SubmitDailyQuizDto, @CurrentUser('id') userId: string) {
    return this.commandBus.execute(new SubmitDailyQuizCommand(userId, body));
  }

  @Post('graduation/:level/submit')
  @ApiOperation({ summary: 'Nộp bài thi tốt nghiệp CEFR chặng cấp độ' })
  async submitGraduationExam(@Param('level') level: string, @Body() body: SubmitGraduationExamDto, @CurrentUser('id') userId: string) {
    return this.commandBus.execute(new SubmitGraduationExamCommand(userId, level, body.percentage));
  }

  // ============================================
  // GRAMMAR COMMUNITY HUB ENDPOINTS
  // ============================================

  @Get('community/posts')
  @ApiOperation({ summary: 'Lấy các bài thảo luận cộng đồng chia sẻ mẹo ngữ pháp' })
  async getCommunityPosts(
    @Query('tag') tag?: string,
    @Query('search') search?: string
  ) {
    return this.queryBus.execute(new GetCommunityPostsQuery(tag, search));
  }

  @Post('community/posts')
  @ApiOperation({ summary: 'Tạo bài thảo luận cộng đồng mới' })
  async createCommunityPost(
    @Body() body: CreateCommunityPostDto,
    @CurrentUser('id') userId: string
  ) {
    return this.commandBus.execute(new CreateCommunityPostCommand(userId, body));
  }

  @Post('community/posts/:id/comments')
  @ApiOperation({ summary: 'Viết bình luận thảo luận dưới bài viết cộng đồng' })
  async addCommunityComment(
    @Param('id') postId: string,
    @Body() body: AddCommunityCommentDto,
    @CurrentUser('id') userId: string
  ) {
    return this.commandBus.execute(new AddCommunityCommentCommand(userId, postId, body.content));
  }

  @Post('community/posts/:id/like')
  @ApiOperation({ summary: 'Thích bài viết cộng đồng' })
  async likeCommunityPost(@Param('id') postId: string) {
    return this.commandBus.execute(new LikeCommunityPostCommand(postId));
  }

  // ============================================
  // CROWDSOURCED QUIZ ENDPOINTS
  // ============================================

  @Post('lessons/:id/crowdsourced')
  @ApiOperation({ summary: 'Học viên đóng góp câu hỏi kiểm tra cho bài học' })
  async submitCrowdsourcedQuiz(
    @Param('id') lessonId: string,
    @Body() body: SubmitCrowdsourcedQuizDto,
    @CurrentUser('id') userId: string
  ) {
    return this.commandBus.execute(new SubmitCrowdsourcedQuizCommand(userId, lessonId, body));
  }

  @Post('quizzes/crowdsourced/:id/upvote')
  @ApiOperation({ summary: 'Bình chọn/Upvote câu hỏi cộng đồng đóng góp' })
  async upvoteCrowdsourcedQuiz(@Param('id') quizId: string, @CurrentUser('id') userId: string) {
    return this.commandBus.execute(new UpvoteCrowdsourcedQuizCommand(userId, quizId));
  }

  @Get('lessons/:id/crowdsourced')
  @ApiOperation({ summary: 'Lấy kho câu hỏi do cộng đồng đóng góp và đã được duyệt của bài học' })
  async getCrowdsourcedQuizzes(@Param('id') lessonId: string) {
    return this.queryBus.execute(new GetCrowdsourcedQuizzesQuery(lessonId));
  }

  // ============================================
  // SPACED REPETITION PRACTICE ENDPOINTS
  // ============================================

  @Get('practice/srs')
  @ApiOperation({ summary: 'Lấy các câu hỏi ôn tập thông minh đến hạn (SRS)' })
  async getSrsDueQuizzes(@CurrentUser('id') userId: string) {
    return this.queryBus.execute(new GetSrsDueQuizzesQuery(userId));
  }

  @Post('practice/srs/:id/submit')
  @ApiOperation({ summary: 'Nộp kết quả câu hỏi ôn tập và tính toán lịch SuperMemo-2 tiếp theo' })
  async submitSrsFeedback(
    @Param('id') quizId: string,
    @Body() body: SubmitSrsFeedbackDto,
    @CurrentUser('id') userId: string
  ) {
    return this.commandBus.execute(new SubmitSrsFeedbackCommand(userId, quizId, body.isCorrect));
  }

  // ============================================
  // CROWDSOURCED PRACTICE EXAM SETS (PHASE 6)
  // ============================================

  @Get('exams')
  @ApiOperation({ summary: 'Lấy danh sách bộ đề thi thử' })
  async getExamSets(
    @CurrentUser('id') userId: string,
    @Query('level') level?: string,
    @Query('type') examType?: string,
    @Query('search') search?: string
  ) {
    return this.queryBus.execute(new GetExamSetsQuery(userId, { level, examType, search }));
  }

  @Post('exams')
  @UseGuards(PermissionsGuard)
  @Permissions('write:admin')
  @ApiOperation({ summary: 'Đóng góp bộ đề thi thử ngữ pháp mới' })
  async createExamSet(@Body() body: CreateExamSetDto, @CurrentUser('id') userId: string) {
    return this.commandBus.execute(new CreateExamSetCommand(userId, 'Học viên ưu tú', body));
  }

  @Post('exams/:id/upvote')
  @ApiOperation({ summary: 'Bình chọn/Upvote bộ đề thi cộng đồng' })
  async upvoteExamSet(@Param('id') id: string) {
    return this.commandBus.execute(new UpvoteExamSetCommand(id));
  }

  @Post('exams/:id/submit')
  @ApiOperation({ summary: 'Nộp kết quả thi thử bộ đề và tính toán cấp chứng chỉ' })
  async submitExamAttempt(
    @Param('id') id: string,
    @Body() body: SubmitExamAttemptDto,
    @CurrentUser('id') userId: string
  ) {
    return this.commandBus.execute(new SubmitExamAttemptCommand(userId, id, body.correctCount, body.totalCount));
  }

  @Get('exams/certificates')
  @ApiOperation({ summary: 'Lấy các chứng chỉ tốt nghiệp ngữ pháp đã được cấp' })
  async getUserCertificates(@CurrentUser('id') userId: string) {
    return this.queryBus.execute(new GetUserCertificatesQuery(userId));
  }

  // ============================================
  // GRAMMAR TRAP DIARY ENDPOINTS (PHASE 7)
  // ============================================

  @Post('trap-diary')
  @ApiOperation({ summary: 'Lưu bẫy ngữ pháp lỗi làm sai của học viên' })
  async saveGrammarTrap(@Body() body: SaveGrammarTrapDto, @CurrentUser('id') userId: string) {
    return this.commandBus.execute(new SaveGrammarTrapCommand(userId, body));
  }

  @Get('trap-diary')
  @ApiOperation({ summary: 'Lấy danh sách bẫy ngữ pháp của người dùng' })
  async getTrapDiary(@CurrentUser('id') userId: string, @Query('status') status?: string) {
    return this.queryBus.execute(new GetGrammarTrapsQuery(userId, status));
  }

  @Post('trap-diary/:id/break')
  @UseGuards(GrammarAbilitiesGuard)
  @ApiOperation({ summary: 'Đánh dấu bẫy đã được phá thành công' })
  async breakGrammarTrap(@Param('id') trapId: string, @CurrentUser('id') userId: string) {
    return this.commandBus.execute(new BreakGrammarTrapCommand(userId, trapId));
  }

  @Post('trap-diary/:id/ai-analysis')
  @UseGuards(GrammarAbilitiesGuard)
  @ApiOperation({ summary: 'Yêu cầu Trợ lý AI giải mã bẫy lỗi sai' })
  async generateAiTrapAnalysis(@Param('id') trapId: string, @CurrentUser('id') userId: string) {
    return this.commandBus.execute(new GenerateAiTrapAnalysisCommand(userId, trapId));
  }
}
