import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';
import type {
  DashboardStats,
  ExamCollection,
  StudyPlanDay,
  Contributor,
  Exam,
  ExamSession,
  ExamResult,
  SessionAnswer,
  SessionViolation,
  SaveSessionAnswerDto,
  RecordSessionViolationDto,
  CertificateItem,
  SaveQuestionDto,
  SaveQuestionResult,
  QuestionBuilderData,
  QuestionVersion,
  CreatorDashboardResponse,
  CollectionEditorResponse,
  ExamBuilderResponse,
  PracticeHistoryResponse,
  CompletedCollectionsResponse,
  FavoritesResponse,
  BookmarksResponse,
  DownloadsResponse,
  PurchasedCollectionsResponse,
} from '../types';

// Standardized Query Cache Time Constants
const STALE_TIME_DASHBOARD = 5 * 60 * 1000; // 5 minutes cache
const STALE_TIME_COLLECTIONS = 10 * 60 * 1000; // 10 minutes cache
const STALE_TIME_STATIC_EXAM = 15 * 60 * 1000; // 15 minutes cache
const STALE_TIME_SESSION = 30 * 1000; // 30 seconds cache for active sessions

export const useCertificationDashboard = () => {
  return useQuery<DashboardStats>({
    queryKey: ['certification', 'dashboard'],
    queryFn: () => CertificationApi.getDashboardStats(),
    staleTime: STALE_TIME_DASHBOARD,
    refetchOnWindowFocus: false,
  });
};

export const useCreatorDashboardData = () => {
  return useQuery<CreatorDashboardResponse>({
    queryKey: ['certification', 'creator-dashboard'],
    queryFn: () => CertificationApi.getCreatorDashboardData(),
    staleTime: STALE_TIME_DASHBOARD,
    refetchOnWindowFocus: false,
  });
};

export const useCollectionEditorData = (id: string) => {
  return useQuery<CollectionEditorResponse | null>({
    queryKey: ['certification', 'collection-editor', id],
    queryFn: () => CertificationApi.getCollectionEditorData(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useExamBuilderData = (id: string) => {
  return useQuery<ExamBuilderResponse | null>({
    queryKey: ['certification', 'exam-builder', id],
    queryFn: () => CertificationApi.getExamBuilderData(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_STATIC_EXAM,
    refetchOnWindowFocus: false,
  });
};

export const useQuestionBuilderData = (id: string) => {
  return useQuery<QuestionBuilderData | null>({
    queryKey: ['certification', 'question-builder', id],
    queryFn: () => CertificationApi.getQuestionBuilderData(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_STATIC_EXAM,
    refetchOnWindowFocus: false,
  });
};

export const useSaveQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SaveQuestionResult, Error, SaveQuestionDto>({
    mutationFn: (dto: SaveQuestionDto) => CertificationApi.saveQuestion(dto),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['certification', 'question-builder', result.id],
      });
      const msg = result.savedToBank
        ? CERTIFICATION_UI_TEXT.toast.saveQuestionToBankSuccess
        : CERTIFICATION_UI_TEXT.toast.saveQuestionSuccess;
      toast(msg);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.saveQuestionError, variant: 'destructive' });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ id: string; deleted: boolean }, Error, string>({
    mutationFn: (id: string) => CertificationApi.deleteQuestion(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['certification', 'question-builder', result.id],
      });
      toast(CERTIFICATION_UI_TEXT.toast.deleteQuestionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.deleteQuestionError, variant: 'destructive' });
    },
  });
};

export const useQuestionHistory = (id: string) => {
  return useQuery<QuestionVersion[]>({
    queryKey: ['certification', 'question-history', id],
    queryFn: () => CertificationApi.getQuestionHistory(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_SESSION,
    refetchOnWindowFocus: false,
  });
};

export const useFeaturedCollections = (exam?: string, search?: string) => {
  const safeExam = exam ?? '';
  const safeSearch = search ?? '';
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'featured', safeExam, safeSearch],
    queryFn: () => CertificationApi.getFeaturedCollections(safeExam, safeSearch),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useTrendingCollections = () => {
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'trending'],
    queryFn: () => CertificationApi.getTrendingCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useOfficialCollections = () => {
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'official'],
    queryFn: () => CertificationApi.getOfficialCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCommunityCollections = () => {
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'community'],
    queryFn: () => CertificationApi.getCommunityCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCollectionDetail = (id: string) => {
  return useQuery<ExamCollection | null>({
    queryKey: ['certification', 'collection', id],
    queryFn: () => CertificationApi.getCollection(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCollectionItems = (collectionId: string) => {
  return useQuery({
    queryKey: ['certification', 'collection-items', collectionId],
    queryFn: () => CertificationApi.getCollectionItems(collectionId),
    enabled: Boolean(collectionId),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCollectionReviews = (collectionId: string) => {
  return useQuery({
    queryKey: ['certification', 'collection-reviews', collectionId],
    queryFn: () => CertificationApi.getCollectionReviews(collectionId),
    enabled: Boolean(collectionId),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useAddCollectionReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ collectionId, rating, text }: { collectionId: string; rating: number; text: string }) =>
      CertificationApi.addCollectionReview(collectionId, { rating, text }),
    onMutate: async (variables) => {
      const { collectionId, rating, text } = variables;

      await queryClient.cancelQueries({ queryKey: ['certification', 'collection-reviews', collectionId] });

      const previousReviews = queryClient.getQueryData<Array<{ id: string; author: string; avatar?: string; rating: number; date: string; text: string }>>(
        ['certification', 'collection-reviews', collectionId]
      );

      queryClient.setQueryData<Array<{ id: string; author: string; avatar?: string; rating: number; date: string; text: string }>>(
        ['certification', 'collection-reviews', collectionId],
        (old) => {
          const optimisticReview = {
            id: `optimistic-${Date.now()}`,
            author: 'You',
            avatar: undefined as string | undefined,
            rating,
            text,
            date: 'Just now',
          };
          return [optimisticReview, ...(old || [])];
        }
      );

      return { previousReviews, collectionId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousReviews) {
        queryClient.setQueryData(
          ['certification', 'collection-reviews', context.collectionId],
          context.previousReviews
        );
      }
      toast({ ...CERTIFICATION_UI_TEXT.toast.addReviewError, variant: 'destructive' });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-reviews', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection', variables.collectionId] });
      toast(CERTIFICATION_UI_TEXT.toast.addReviewSuccess);
    },
  });
};

export const useCollectionDiscussions = (collectionId: string) => {
  return useQuery({
    queryKey: ['certification', 'collection-discussions', collectionId],
    queryFn: () => CertificationApi.getCollectionDiscussions(collectionId),
    enabled: Boolean(collectionId),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useAddCollectionDiscussion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ collectionId, title, content }: { collectionId: string; title: string; content: string }) =>
      CertificationApi.addCollectionDiscussion(collectionId, { title, content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-discussions', variables.collectionId] });
      toast(CERTIFICATION_UI_TEXT.toast.addDiscussionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.addDiscussionError, variant: 'destructive' });
    },
  });
};

export const useCollectionActivities = (collectionId: string) => {
  return useQuery({
    queryKey: ['certification', 'collection-activities', collectionId],
    queryFn: () => CertificationApi.getCollectionActivities(collectionId),
    enabled: Boolean(collectionId),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useStudyPlan = () => {
  return useQuery<StudyPlanDay[]>({
    queryKey: ['certification', 'study-plan'],
    queryFn: () => CertificationApi.getStudyPlan(),
    staleTime: STALE_TIME_DASHBOARD,
    refetchOnWindowFocus: false,
  });
};

export const useTopContributors = () => {
  return useQuery<Contributor[]>({
    queryKey: ['certification', 'top-contributors'],
    queryFn: () => CertificationApi.getTopContributors(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useExamDetail = (id: string) => {
  return useQuery<Exam | null>({
    queryKey: ['certification', 'exam', id],
    queryFn: () => CertificationApi.getExam(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_STATIC_EXAM,
    refetchOnWindowFocus: false,
  });
};

export const useStartExamSession = () => {
  const queryClient = useQueryClient();

  const { toast } = useToast();

  return useMutation<ExamSession, Error, string>({
    mutationFn: (examId: string) => CertificationApi.startExamSession(examId),
    onSuccess: (sessionData) => {
      queryClient.setQueryData(['certification', 'session', sessionData.id], sessionData);
      queryClient.invalidateQueries({ queryKey: ['certification', 'dashboard'] });
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.startSessionError, variant: 'destructive' });
    },
  });
};

export const useExamSession = (sessionId: string) => {
  return useQuery<ExamSession | null>({
    queryKey: ['certification', 'session', sessionId],
    queryFn: () => CertificationApi.getExamSession(sessionId),
    enabled: Boolean(sessionId),
    staleTime: STALE_TIME_SESSION,
    refetchOnWindowFocus: false,
  });
};

export const useSaveSessionAnswer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SessionAnswer, Error, { sessionId: string; dto: SaveSessionAnswerDto }>({
    mutationFn: ({ sessionId, dto }) => CertificationApi.saveSessionAnswer(sessionId, dto),
    onSuccess: (savedAnswer, variables) => {
      queryClient.setQueryData<ExamSession | undefined>(
        ['certification', 'session', variables.sessionId],
        (oldSession) => {
          if (!oldSession) return oldSession;
          const existingAnswerIndex = oldSession.answers.findIndex(
            (ans) => ans.questionId === variables.dto.questionId
          );
          let updatedAnswers: SessionAnswer[];
          if (existingAnswerIndex >= 0) {
            updatedAnswers = [...oldSession.answers];
            updatedAnswers[existingAnswerIndex] = {
              ...updatedAnswers[existingAnswerIndex],
              answerText: variables.dto.answerText ?? null,
              choiceIds: variables.dto.choiceIds ?? [],
              savedAt: new Date().toISOString(),
            };
          } else {
            updatedAnswers = [
              ...oldSession.answers,
              {
                id: savedAnswer.id,
                sessionId: variables.sessionId,
                questionId: variables.dto.questionId,
                answerText: variables.dto.answerText ?? null,
                choiceIds: variables.dto.choiceIds ?? [],
                savedAt: new Date().toISOString(),
              },
            ];
          }
          return {
            ...oldSession,
            answers: updatedAnswers,
          };
        }
      );
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.saveAnswerError, variant: 'destructive' });
    },
  });
};

export const useRecordSessionViolation = () => {
  const { toast } = useToast();

  return useMutation<SessionViolation, Error, { sessionId: string; dto: RecordSessionViolationDto }>({
    mutationFn: ({ sessionId, dto }) => CertificationApi.recordSessionViolation(sessionId, dto),
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.recordViolationError, variant: 'destructive' });
    },
  });
};

export const useSubmitExamSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ExamResult, Error, string>({
    mutationFn: (sessionId: string) => CertificationApi.submitExamSession(sessionId),
    onSuccess: (resultData) => {
      queryClient.setQueryData(['certification', 'result', resultData.id], resultData);
      queryClient.invalidateQueries({ queryKey: ['certification', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['certification', 'study-plan'] });
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.submitSessionError, variant: 'destructive' });
    },
  });
};

export const useExamResult = (resultId: string) => {
  return useQuery<ExamResult | null>({
    queryKey: ['certification', 'result', resultId],
    queryFn: () => CertificationApi.getExamResult(resultId),
    enabled: Boolean(resultId),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useSavedCollections = () => {
  return useQuery<ExamCollection[]>({
    queryKey: ['certification', 'saved-collections'],
    queryFn: () => CertificationApi.getSavedCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useSaveCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ saved: boolean }, Error, string>({
    mutationFn: (id: string) => CertificationApi.saveCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'saved-collections'] });
      toast(CERTIFICATION_UI_TEXT.toast.saveCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.saveCollectionError, variant: 'destructive' });
    },
  });
};

export const useCloneCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ cloned: boolean; newCollectionId: string }, Error, string>({
    mutationFn: (id: string) => CertificationApi.cloneCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collections'] });
      toast(CERTIFICATION_UI_TEXT.toast.cloneCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.cloneCollectionError, variant: 'destructive' });
    },
  });
};

export const useReportCollection = () => {
  const { toast } = useToast();

  return useMutation<{ reported: boolean }, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => CertificationApi.reportCollection(id, reason),
    onSuccess: () => {
      toast(CERTIFICATION_UI_TEXT.toast.reportCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.reportCollectionError, variant: 'destructive' });
    },
  });
};

export const usePracticeHistoryData = () => {
  return useQuery<PracticeHistoryResponse>({
    queryKey: ['certification', 'history'],
    queryFn: () => CertificationApi.getPracticeHistory(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useCompletedCollectionsData = () => {
  return useQuery<CompletedCollectionsResponse>({
    queryKey: ['certification', 'completed'],
    queryFn: () => CertificationApi.getCompletedCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useFavoritesData = () => {
  return useQuery<FavoritesResponse>({
    queryKey: ['certification', 'favorites'],
    queryFn: () => CertificationApi.getFavorites(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useBookmarksData = () => {
  return useQuery<BookmarksResponse>({
    queryKey: ['certification', 'bookmarks'],
    queryFn: () => CertificationApi.getBookmarks(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useInProgressSessions = () => {
  return useQuery({
    queryKey: ['certification', 'in-progress'],
    queryFn: () => CertificationApi.getInProgressSessions(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useClonedCollections = () => {
  return useQuery({
    queryKey: ['certification', 'cloned'],
    queryFn: () => CertificationApi.getClonedCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: { itemId: string; itemType?: string; title?: string; folderName?: string }) =>
      CertificationApi.addBookmark(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'bookmarks'] });
      toast(CERTIFICATION_UI_TEXT.toast.addBookmarkSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.addBookmarkError, variant: 'destructive' });
    },
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => CertificationApi.removeBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'bookmarks'] });
      toast(CERTIFICATION_UI_TEXT.toast.removeBookmarkSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.removeBookmarkError, variant: 'destructive' });
    },
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (collectionId: string) => CertificationApi.addFavorite(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'favorites'] });
      toast(CERTIFICATION_UI_TEXT.toast.addFavoriteSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.addFavoriteError, variant: 'destructive' });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => CertificationApi.removeFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'favorites'] });
      toast(CERTIFICATION_UI_TEXT.toast.removeFavoriteSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.removeFavoriteError, variant: 'destructive' });
    },
  });
};

export const useDeleteDownload = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => CertificationApi.deleteDownload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'downloads'] });
      toast(CERTIFICATION_UI_TEXT.toast.deleteDownloadSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.deleteDownloadError, variant: 'destructive' });
    },
  });
};

export const useClearDownloads = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => CertificationApi.clearDownloads(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'downloads'] });
      toast(CERTIFICATION_UI_TEXT.toast.clearDownloadsSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.clearDownloadsError, variant: 'destructive' });
    },
  });
};

export const useDownloadsData = () => {
  return useQuery<DownloadsResponse>({
    queryKey: ['certification', 'downloads'],
    queryFn: () => CertificationApi.getDownloads(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const usePurchasedCollectionsData = () => {
  return useQuery<PurchasedCollectionsResponse>({
    queryKey: ['certification', 'purchased'],
    queryFn: () => CertificationApi.getPurchasedCollections(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useUserCertificates = () => {
  return useQuery<CertificateItem[]>({
    queryKey: ['certification', 'user-certificates'],
    queryFn: () => CertificationApi.getCertificates(),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useDownloadCertificate = () => {
  const { toast } = useToast();

  return useMutation<{ success: boolean; url: string }, Error, string>({
    mutationFn: (certificateId: string) => CertificationApi.downloadCertificate(certificateId),
    onSuccess: () => {
      toast(CERTIFICATION_UI_TEXT.toast.downloadCertificateSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.downloadCertificateError, variant: 'destructive' });
    },
  });
};

// ===== Collection Editor Mutations =====

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ id: string; title: string; description: string | null }, Error, { title: string; description?: string | null }>({
    mutationFn: (dto) => CertificationApi.createCollection(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collections'] });
      toast(CERTIFICATION_UI_TEXT.toast.createCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.createCollectionError, variant: 'destructive' });
    },
  });
};

export const useUpdateCollection = () => {
  const { toast } = useToast();

  return useMutation<{ id: string }, Error, { collectionId: string; title?: string; description?: string | null; publishStatus?: string }>({
    mutationFn: ({ collectionId, ...dto }) => CertificationApi.updateCollection(collectionId, dto),
    onSuccess: () => {
      toast(CERTIFICATION_UI_TEXT.toast.updateCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.updateCollectionError, variant: 'destructive' });
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ deleted: boolean }, Error, string>({
    mutationFn: (collectionId) => CertificationApi.deleteCollection(collectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collections'] });
      toast(CERTIFICATION_UI_TEXT.toast.deleteCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.deleteCollectionError, variant: 'destructive' });
    },
  });
};

// ===== Exam CRUD Mutations =====

export const useCreateExam = () => {
  const { toast } = useToast();

  return useMutation<{ id: string; title: string; collectionId: string }, Error, { collectionId: string; title: string; description?: string | null; duration?: number; totalQuestions?: number; maxScore?: number; passScore?: number; examType?: string; certificationType?: string; chapterId?: string; sections?: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number }> }>({
    mutationFn: ({ collectionId, ...dto }) => CertificationApi.createExam(collectionId, dto),
    onSuccess: () => {
      toast(CERTIFICATION_UI_TEXT.toast.createExamSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.createExamError, variant: 'destructive' });
    },
  });
};

export const useUpdateExam = () => {
  const { toast } = useToast();

  return useMutation<{ id: string }, Error, { examId: string; title?: string; description?: string | null; duration?: number; totalQuestions?: number; maxScore?: number; passScore?: number; publishStatus?: string }>({
    mutationFn: ({ examId, ...dto }) => CertificationApi.updateExam(examId, dto),
    onSuccess: () => {
      toast(CERTIFICATION_UI_TEXT.toast.updateExamSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.updateExamError, variant: 'destructive' });
    },
  });
};

export const useDeleteExam = () => {
  const { toast } = useToast();

  return useMutation<{ deleted: boolean }, Error, { examId: string; collectionId: string }>({
    mutationFn: ({ examId }) => CertificationApi.deleteExam(examId),
    onSuccess: () => {
      toast(CERTIFICATION_UI_TEXT.toast.deleteExamSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.deleteExamError, variant: 'destructive' });
    },
  });
};

// ===== Chapter CRUD Mutations =====

export const useSyncChapters = () => {
  const { toast } = useToast();

  return useMutation<Array<{ id: string }>, Error, { collectionId: string; chapters: Array<{ id?: string; title: string; description?: string | null; order: number }> }>({
    mutationFn: ({ collectionId, chapters }) => CertificationApi.syncChapters(collectionId, chapters),
    onSuccess: () => {
      toast(CERTIFICATION_UI_TEXT.toast.updateCollectionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.updateCollectionError, variant: 'destructive' });
    },
  });
};
