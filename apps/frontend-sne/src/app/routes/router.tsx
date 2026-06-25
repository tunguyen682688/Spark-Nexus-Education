import {
  createBrowserRouter,
  useRouteError,
  isRouteErrorResponse,
} from 'react-router-dom';
import {
  authGuardLoader,
  permissionGuardLoader,
  roleGuardLoader,
} from '@spark-nest-ed/frontend-core-auth';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';

// Local loading fallback component to avoid static import conflict
const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Error boundary component that works with data router
// This must be defined here to have access to router context when rendered
// Uses window.location instead of Link/navigate to avoid router context issues
const RouteErrorBoundary = () => {
  const error = useRouteError();

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <p className="text-xl text-gray-600 mt-4">Page not found</p>
            <button
              onClick={handleGoHome}
              className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    if (error.status === 401) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Unauthorized</h1>
            <p className="mt-4">Please log in to continue</p>
            <button
              onClick={handleGoHome}
              className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    if (error.status === 403) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Forbidden</h1>
            <p className="mt-4">
              You don't have permission to access this resource
            </p>
            <button
              onClick={handleGoHome}
              className="mt-6 inline-block px-6 py-3 text-blue-600 hover:text-blue-700 underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="mt-4 text-gray-600">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export const createRouter = () =>
  createBrowserRouter([
    {
      path: '/callback',
      lazy: async () => {
        const { CallbackPage, callbackLoader } = await import('./Callback');
        return { Component: CallbackPage, loader: callbackLoader };
      },
      errorElement: <RouteErrorBoundary />,
    },
    // Public routes
    {
      path: '/',
      lazy: async () => {
        const { HomePage } = await import(
          '@spark-nest-ed/frontend-shared-pages'
        );
        return { Component: HomePage };
      },
      hydrateFallbackElement: <LoadingFallback />,
      errorElement: <RouteErrorBoundary />,
    },
    // Plans
    {
      path: 'plans',
      lazy: async () => {
        const { PlansSelectionPage } = await import(
          '@spark-nest-ed/frontend-shared-pages'
        );
        return { Component: PlansSelectionPage };
      },
      hydrateFallbackElement: <LoadingFallback />,
      errorElement: <RouteErrorBoundary />,
    },
    // ull screen blank layout
    {
      loader: authGuardLoader,
      lazy: async () => {
        const { BlankLayout } = await import('./layouts/BlankLayout');
        return { Component: BlankLayout };
      },
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: ROUTES.READING.STUDIO_EDIT,
          lazy: async () => {
            const { ContentStudioPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: ContentStudioPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: ROUTES.READING.STUDIO,
          lazy: async () => {
            const { ContentStudioPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: ContentStudioPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
      ],
    },
    // main layout
    // Dashboard
    {
      loader: authGuardLoader,
      lazy: async () => {
        const { MainLayout } = await import('./layouts/MainLayout');
        return { Component: MainLayout };
      },
      errorElement: <RouteErrorBoundary />,
      children: [
        // Dashboard
        {
          path: ROUTES.DASHBOARD,
          lazy: async () => {
            const { DashboardPage } = await import(
              '@spark-nest-ed/frontend-shared-pages'
            );
            return { Component: DashboardPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Library routes
        {
          path: ROUTES.LIBRARY,
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Thư viện</h1>
                <p className="text-muted-foreground">
                  Trang thư viện đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'library/documents',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Tài liệu</h1>
                <p className="text-muted-foreground">
                  Trang tài liệu đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'library/books',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Sách</h1>
                <p className="text-muted-foreground">
                  Trang sách đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'library/videos',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Video</h1>
                <p className="text-muted-foreground">
                  Trang video đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'library/favorites',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Yêu thích</h1>
                <p className="text-muted-foreground">
                  Trang yêu thích đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Vocabulary routes
        {
          path: ROUTES.VOCABULARIES.DETAIL_SET_VOCABULARY,
          lazy: async () => {
            const { DetailVocabularySetPage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: DetailVocabularySetPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: ROUTES.VOCABULARIES.OVERVIEW_SET_VOCABULARY_LEARNING,
          lazy: async () => {
            const { OverviewLearningVocabularySetPage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: OverviewLearningVocabularySetPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // CRUD Vocabulary Set
        {
          path: ROUTES.VOCABULARIES.CREATE,
          lazy: async () => {
            const { EditorVocabularySetPage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: EditorVocabularySetPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: ROUTES.VOCABULARIES.UPDATE,
          lazy: async () => {
            const { EditorVocabularySetPage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: EditorVocabularySetPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // View Vocabulary
        {
          path: ROUTES.VOCABULARIES.DETAIL_WORD_VOCABULARY,
          lazy: async () => {
            const { DetailVocabularyPage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: DetailVocabularyPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Flashcard Vocabulary Set
        {
          path: ROUTES.VOCABULARIES.FLASHCARD,
          lazy: async () => {
            const { FlashcardPracticePage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: FlashcardPracticePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Quiz Vocabulary Set
        {
          path: ROUTES.VOCABULARIES.QUIZ,
          lazy: async () => {
            const { QuizPracticePage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: QuizPracticePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Test (Advanced Exam) Vocabulary Set
        {
          path: ROUTES.VOCABULARIES.TEST,
          lazy: async () => {
            const { TestPracticePage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: TestPracticePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Review Vocabulary Set
        {
          path: 'vocabularies/review',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Ôn tập (SRS)</h1>
                <p className="text-muted-foreground">
                  Trang ôn tập đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Community Vocabulary Set
        {
          path: ROUTES.VOCABULARIES.COMMUNITY,
          lazy: async () => {
            const { CommunityVocabularySetPage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: CommunityVocabularySetPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // My Libary Vocabulary Set
        {
          path: ROUTES.VOCABULARIES.MY_VOCABULARY_SET,
          lazy: async () => {
            const { MyLibaryVocabularySetPage } = await import(
              '@spark-nest-ed/feature-vocabulary'
            );
            return { Component: MyLibaryVocabularySetPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Grammar routes
        {
          path: 'grammar',
          lazy: async () => {
            const { GrammarLearningPathPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarLearningPathPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'grammar/profile',
          lazy: async () => {
            const { GrammarUserProfilePage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarUserProfilePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'grammar/leaderboard',
          lazy: async () => {
            const { GrammarLeaderboardPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarLeaderboardPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Create/Edit Lesson Grammar
        {
          path: 'grammar/lessons/create',
          lazy: async () => {
            const { GrammarLessonEditorPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarLessonEditorPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Study/Detail Lesson Grammar
        {
          path: 'grammar/lessons/:id',
          lazy: async () => {
            const { GrammarLessonDetailPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarLessonDetailPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Edit Lesson Grammar
        {
          path: 'grammar/lessons/:id/edit',
          lazy: async () => {
            const { GrammarLessonEditorPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarLessonEditorPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Daily Quiz route
        {
          path: 'grammar/daily-quiz',
          lazy: async () => {
            const { GrammarDailyQuizPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarDailyQuizPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Assessment Summary Quiz route
        {
          path: 'grammar/lessons/:id/assessment',
          lazy: async () => {
            const { GrammarAssessmentQuizPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarAssessmentQuizPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Graduation Level Quiz route
        {
          path: 'grammar/graduation/:level',
          lazy: async () => {
            const { GrammarLevelGraduationPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarLevelGraduationPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Grammar Community route
        {
          path: 'grammar/community',
          lazy: async () => {
            const { GrammarCommunityPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarCommunityPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Grammar Community Create Post route
        {
          path: 'grammar/community/create',
          lazy: async () => {
            const { GrammarCreatePostPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarCreatePostPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Grammar Community Post Detail route
        {
          path: 'grammar/community/:postId',
          lazy: async () => {
            const { GrammarCommunityPostDetailPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarCommunityPostDetailPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Grammar Exam Sets Hub route
        {
          path: 'grammar/exams',
          lazy: async () => {
            const { GrammarExamHubPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarExamHubPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Grammar Exam Set Creator route
        {
          path: 'grammar/exams/create',
          lazy: async () => {
            const { GrammarExamCreatorPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarExamCreatorPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Grammar Exam Arena route
        {
          path: 'grammar/exams/:id',
          lazy: async () => {
            const { GrammarExamArenaPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarExamArenaPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Grammar Trap Diary route (Phase 7)
        {
          path: 'grammar/trap-diary',
          lazy: async () => {
            const { GrammarTrapDiaryPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarTrapDiaryPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Grammar Analytics Dashboard route (Phase 8)
        {
          path: 'grammar/analytics',
          lazy: async () => {
            const { GrammarAnalyticsDashboardPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarAnalyticsDashboardPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        // Grammar Practice Hub route
        {
          path: 'grammar/practice',
          lazy: async () => {
            const { GrammarPracticeHubPage } = await import(
              '@spark-nest-ed/feature-grammar'
            );
            return { Component: GrammarPracticeHubPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Listening routes
        {
          path: 'listening',
          lazy: async () => {
            const { ListeningHubPage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningHubPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/library',
          lazy: async () => {
            const { ListeningLibraryPage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningLibraryPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/contribute',
          lazy: async () => {
            const { ListeningContributePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningContributePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/explore',
          lazy: async () => {
            const { ListeningExplorePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningExplorePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/podcasts',
          lazy: async () => {
            const { ListeningExplorePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningExplorePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/videos',
          lazy: async () => {
            const { ListeningExplorePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningExplorePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/audiobooks',
          lazy: async () => {
            const { ListeningExplorePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningExplorePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/practice',
          lazy: async () => {
            const { ListeningExplorePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningExplorePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/news',
          lazy: async () => {
            const { ListeningExplorePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningExplorePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/dictation/:id',
          lazy: async () => {
            const { DictationWorkspacePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: DictationWorkspacePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/study/:id',
          lazy: async () => {
            const { ListeningStudyDashboardPage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ListeningStudyDashboardPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/study/:id/transcript',
          lazy: async () => {
            const { TranscriptWorkspacePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: TranscriptWorkspacePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/study/:id/dictation',
          lazy: async () => {
            const { DictationWorkspacePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: DictationWorkspacePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/study/:id/quiz',
          lazy: async () => {
            const { QuizWorkspacePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: QuizWorkspacePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/study/:id/shadowing',
          lazy: async () => {
            const { ShadowingWorkspacePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: ShadowingWorkspacePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'listening/study/:id/gapfill',
          lazy: async () => {
            const { GapFillWorkspacePage } = await import(
              '@spark-nest-ed/feature-listening'
            );
            return { Component: GapFillWorkspacePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Speaking routes
        {
          path: 'speaking',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Nói</h1>
                <p className="text-muted-foreground">
                  Trang nói đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'speaking/pronunciation',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Luyện phát âm</h1>
                <p className="text-muted-foreground">
                  Trang luyện phát âm đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'speaking/conversations',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Hội thoại</h1>
                <p className="text-muted-foreground">
                  Trang hội thoại đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'speaking/recording',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Ghi âm</h1>
                <p className="text-muted-foreground">
                  Trang ghi âm đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'speaking/assessment',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Đánh giá phát âm</h1>
                <p className="text-muted-foreground">
                  Trang đánh giá phát âm đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Reading routes
        {
          path: ROUTES.READING.MY_LIBRARY,
          lazy: async () => {
            const { MyLibraryPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: MyLibraryPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: ROUTES.READING.EXPLORE,
          lazy: async () => {
            const { ExplorePage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: ExplorePage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: ROUTES.READING.HUB,
          lazy: async () => {
            const { ArticleHubPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: ArticleHubPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        {
          path: ROUTES.READING.ARTICLE,
          lazy: async () => {
            const { AdvancedReaderPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: AdvancedReaderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'reading/articles',
          lazy: async () => {
            const { ArticlesPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: ArticlesPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'reading/stories',
          lazy: async () => {
            const { BooksPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: BooksPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: ROUTES.READING.NEWS,
          lazy: async () => {
            const { NewsPage } = await import('@spark-nest-ed/feature-reading');
            return { Component: NewsPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: ROUTES.READING.ACADEMIC,
          lazy: async () => {
            const { BooksPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: BooksPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: ROUTES.READING.BOOKS,
          lazy: async () => {
            const { BooksPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: BooksPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'reading/history',
          lazy: async () => {
            const { HistoryPage } = await import(
              '@spark-nest-ed/feature-reading'
            );
            return { Component: HistoryPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Writing routes
        {
          path: 'writing',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Viết</h1>
                <p className="text-muted-foreground">
                  Trang viết đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'writing/practice',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Luyện viết</h1>
                <p className="text-muted-foreground">
                  Trang luyện viết đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'writing/grading',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Chấm điểm tự động</h1>
                <p className="text-muted-foreground">
                  Trang chấm điểm tự động đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'writing/samples',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Mẫu bài viết</h1>
                <p className="text-muted-foreground">
                  Trang mẫu bài viết đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'writing/my-writings',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Bài viết của tôi</h1>
                <p className="text-muted-foreground">
                  Trang bài viết của tôi đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Study Plan routes
        {
          path: 'study-plan',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Kế hoạch học tập</h1>
                <p className="text-muted-foreground">
                  Trang kế hoạch học tập đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'study-plan/my-plans',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Kế hoạch của tôi</h1>
                <p className="text-muted-foreground">
                  Trang kế hoạch của tôi đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'study-plan/schedule',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Lịch học</h1>
                <p className="text-muted-foreground">
                  Trang lịch học đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'study-plan/goals',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Mục tiêu</h1>
                <p className="text-muted-foreground">
                  Trang mục tiêu đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Assessments routes
        {
          path: 'assessments',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Kiểm tra & Đánh giá</h1>
                <p className="text-muted-foreground">
                  Trang kiểm tra & đánh giá đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'assessments/tests',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Bài kiểm tra</h1>
                <p className="text-muted-foreground">
                  Trang bài kiểm tra đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'assessments/level-test',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Đánh giá trình độ</h1>
                <p className="text-muted-foreground">
                  Trang đánh giá trình độ đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'assessments/history',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Lịch sử kiểm tra</h1>
                <p className="text-muted-foreground">
                  Trang lịch sử kiểm tra đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'assessments/reports',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Báo cáo kết quả</h1>
                <p className="text-muted-foreground">
                  Trang báo cáo kết quả đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Community routes
        {
          path: 'community',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Cộng đồng</h1>
                <p className="text-muted-foreground">
                  Trang cộng đồng đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'community/forum',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Diễn đàn</h1>
                <p className="text-muted-foreground">
                  Trang diễn đàn đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'community/study-groups',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Nhóm học tập</h1>
                <p className="text-muted-foreground">
                  Trang nhóm học tập đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'community/share',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Chia sẻ</h1>
                <p className="text-muted-foreground">
                  Trang chia sẻ đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'community/discussions',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Thảo luận</h1>
                <p className="text-muted-foreground">
                  Trang thảo luận đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },

        // Games routes
        {
          path: 'games',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Trò chơi</h1>
                <p className="text-muted-foreground">
                  Trang trò chơi đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'games/vocabulary',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Trò chơi từ vựng</h1>
                <p className="text-muted-foreground">
                  Trang trò chơi từ vựng đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'games/grammar',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Trò chơi ngữ pháp</h1>
                <p className="text-muted-foreground">
                  Trang trò chơi ngữ pháp đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'games/challenges',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Thử thách</h1>
                <p className="text-muted-foreground">
                  Trang thử thách đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: 'games/leaderboard',
          lazy: async () => {
            const PlaceholderPage = () => (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Bảng xếp hạng</h1>
                <p className="text-muted-foreground">
                  Trang bảng xếp hạng đang được phát triển...
                </p>
              </div>
            );
            return { Component: PlaceholderPage };
          },
          hydrateFallbackElement: <LoadingFallback />,
          errorElement: <RouteErrorBoundary />,
        },
      ],
    },
    // Admin routes
    {
      path: '/admin',
      loader: roleGuardLoader(['admin']),
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          path: 'users',
          loader: permissionGuardLoader('users:manage'),
        },
      ],
    },
  ]);
