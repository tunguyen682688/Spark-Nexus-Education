import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureDatabaseModule } from '@spark-nest-ed/infrastructure-database';
import { GrammarController } from './presentation/controllers/grammar.controller';

// ===== REPOSITORY TOKENS & IMPLEMENTATIONS =====
import { GRAMMAR_LESSON_REPOSITORY } from './domain/repositories/grammar-lesson.repository.interface';
import { GrammarLessonRepository } from './infrastructure/repositories/grammar-lesson.repository';

import { GRAMMAR_PROGRESS_REPOSITORY } from './domain/repositories/grammar-progress.repository.interface';
import { GrammarProgressRepository } from './infrastructure/repositories/grammar-progress.repository';

import { GRAMMAR_COMMUNITY_REPOSITORY } from './domain/repositories/grammar-community.repository.interface';
import { GrammarCommunityRepository } from './infrastructure/repositories/grammar-community.repository';

import { GRAMMAR_EXAM_REPOSITORY } from './domain/repositories/grammar-exam.repository.interface';
import { GrammarExamRepository } from './infrastructure/repositories/grammar-exam.repository';

import { GRAMMAR_TRAP_REPOSITORY } from './domain/repositories/grammar-trap.repository.interface';
import { GrammarTrapRepository } from './infrastructure/repositories/grammar-trap.repository';

import { GRAMMAR_STREAK_REPOSITORY } from './domain/repositories/grammar-streak.repository.interface';
import { GrammarStreakRepository } from './infrastructure/repositories/grammar-streak.repository';

import { GRAMMAR_SRS_REPOSITORY } from './domain/repositories/grammar-srs.repository.interface';
import { GrammarSrsRepository } from './infrastructure/repositories/grammar-srs.repository';

import { GRAMMAR_GRADUATION_REPOSITORY } from './domain/repositories/grammar-graduation.repository.interface';
import { GrammarGraduationRepository } from './infrastructure/repositories/grammar-graduation.repository';

// ===== COMMAND HANDLERS =====
import { CreateLessonHandler } from './application/commands/create-lesson';
import { UpdateLessonHandler } from './application/commands/update-lesson';
import { CompleteLessonHandler } from './application/commands/complete-lesson';
import { UpdateLessonProgressHandler } from './application/commands/update-lesson-progress';
import { SubmitDailyQuizHandler } from './application/commands/submit-daily-quiz';
import { SubmitGraduationExamHandler } from './application/commands/submit-graduation-exam';
import { CreateCommunityPostHandler } from './application/commands/create-community-post';
import { AddCommunityCommentHandler } from './application/commands/add-community-comment';
import { LikeCommunityPostHandler } from './application/commands/like-community-post';
import { SubmitCrowdsourcedQuizHandler } from './application/commands/submit-crowdsourced-quiz';
import { UpvoteCrowdsourcedQuizHandler } from './application/commands/upvote-crowdsourced-quiz';
import { SubmitSrsFeedbackHandler } from './application/commands/submit-srs-feedback';
import { CreateExamSetHandler } from './application/commands/create-exam-set';
import { UpvoteExamSetHandler } from './application/commands/upvote-exam-set';
import { SubmitExamAttemptHandler } from './application/commands/submit-exam-attempt';
import { SaveGrammarTrapHandler } from './application/commands/save-grammar-trap';
import { BreakGrammarTrapHandler } from './application/commands/break-grammar-trap';
import { GenerateAiTrapAnalysisHandler } from './application/commands/generate-ai-trap-analysis';

// ===== QUERY HANDLERS =====
import { GetRoadmapHandler } from './application/queries/get-roadmap';
import { GetLessonDetailHandler } from './application/queries/get-lesson-detail';
import { GetDailyQuizHandler } from './application/queries/get-daily-quiz';
import { GetPracticeQuestionsHandler } from './application/queries/get-practice-questions';
import { GetCommunityPostsHandler } from './application/queries/get-community-posts';
import { GetCrowdsourcedQuizzesHandler } from './application/queries/get-crowdsourced-quizzes';
import { GetSrsDueQuizzesHandler } from './application/queries/get-srs-due-quizzes';
import { GetExamSetsHandler } from './application/queries/get-exam-sets';
import { GetUserCertificatesHandler } from './application/queries/get-user-certificates';
import { GetGrammarTrapsHandler } from './application/queries/get-grammar-traps';
import { GetLeaderboardHandler } from './application/queries/get-leaderboard';
import { GetAnalyticsSummaryHandler } from './application/queries/get-analytics-summary';

// ===== APPLICATION EVENT HANDLERS =====
import { XpRewardHandler } from './application/events/xp-reward.handler';
import { CrowdsourcedQuizApprovedHandler } from './application/events/crowdsourced-quiz-approved.handler';
import { GraduationUnlockHandler } from './application/events/graduation-unlock.handler';

const CommandHandlers = [
  CreateLessonHandler,
  UpdateLessonHandler,
  CompleteLessonHandler,
  UpdateLessonProgressHandler,
  SubmitDailyQuizHandler,
  SubmitGraduationExamHandler,
  CreateCommunityPostHandler,
  AddCommunityCommentHandler,
  LikeCommunityPostHandler,
  SubmitCrowdsourcedQuizHandler,
  UpvoteCrowdsourcedQuizHandler,
  SubmitSrsFeedbackHandler,
  CreateExamSetHandler,
  UpvoteExamSetHandler,
  SubmitExamAttemptHandler,
  SaveGrammarTrapHandler,
  BreakGrammarTrapHandler,
  GenerateAiTrapAnalysisHandler,
];

const QueryHandlers = [
  GetRoadmapHandler,
  GetLessonDetailHandler,
  GetDailyQuizHandler,
  GetPracticeQuestionsHandler,
  GetCommunityPostsHandler,
  GetCrowdsourcedQuizzesHandler,
  GetSrsDueQuizzesHandler,
  GetExamSetsHandler,
  GetUserCertificatesHandler,
  GetGrammarTrapsHandler,
  GetLeaderboardHandler,
  GetAnalyticsSummaryHandler,
];

const EventHandlers = [
  XpRewardHandler,
  CrowdsourcedQuizApprovedHandler,
  GraduationUnlockHandler,
];

@Module({
  imports: [
    CqrsModule.forRoot(),
    InfrastructureDatabaseModule,
  ],
  controllers: [
    GrammarController,
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,

    // Repository Bindings
    {
      provide: GRAMMAR_LESSON_REPOSITORY,
      useClass: GrammarLessonRepository,
    },
    {
      provide: GRAMMAR_PROGRESS_REPOSITORY,
      useClass: GrammarProgressRepository,
    },
    {
      provide: GRAMMAR_COMMUNITY_REPOSITORY,
      useClass: GrammarCommunityRepository,
    },
    {
      provide: GRAMMAR_EXAM_REPOSITORY,
      useClass: GrammarExamRepository,
    },
    {
      provide: GRAMMAR_TRAP_REPOSITORY,
      useClass: GrammarTrapRepository,
    },
    {
      provide: GRAMMAR_STREAK_REPOSITORY,
      useClass: GrammarStreakRepository,
    },
    {
      provide: GRAMMAR_SRS_REPOSITORY,
      useClass: GrammarSrsRepository,
    },
    {
      provide: GRAMMAR_GRADUATION_REPOSITORY,
      useClass: GrammarGraduationRepository,
    },
  ],
  exports: [
    CqrsModule,
    GRAMMAR_LESSON_REPOSITORY,
    GRAMMAR_PROGRESS_REPOSITORY,
    GRAMMAR_COMMUNITY_REPOSITORY,
    GRAMMAR_EXAM_REPOSITORY,
    GRAMMAR_TRAP_REPOSITORY,
    GRAMMAR_STREAK_REPOSITORY,
    GRAMMAR_SRS_REPOSITORY,
    GRAMMAR_GRADUATION_REPOSITORY,
  ],
})
export class GrammarModule {}
