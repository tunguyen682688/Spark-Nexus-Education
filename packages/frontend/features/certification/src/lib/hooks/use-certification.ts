import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../api/certification-api';
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-reviews', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection', variables.collectionId] });
      toast({
        title: 'Đã gửi đánh giá',
        description: 'Cảm ơn bạn đã gửi đánh giá cho bộ đề này!',
      });
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
      toast({
        title: 'Đã tạo thảo luận',
        description: 'Chủ đề thảo luận của bạn đã được đăng thành công!',
      });
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

  return useMutation<ExamSession, Error, string>({
    mutationFn: (examId: string) => CertificationApi.startExamSession(examId),
    onSuccess: (sessionData) => {
      queryClient.setQueryData(['certification', 'session', sessionData.id], sessionData);
      queryClient.invalidateQueries({ queryKey: ['certification', 'dashboard'] });
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
  });
};

export const useRecordSessionViolation = () => {
  return useMutation<SessionViolation, Error, { sessionId: string; dto: RecordSessionViolationDto }>({
    mutationFn: ({ sessionId, dto }) => CertificationApi.recordSessionViolation(sessionId, dto),
  });
};

export const useSubmitExamSession = () => {
  const queryClient = useQueryClient();

  return useMutation<ExamResult, Error, string>({
    mutationFn: (sessionId: string) => CertificationApi.submitExamSession(sessionId),
    onSuccess: (resultData) => {
      queryClient.setQueryData(['certification', 'result', resultData.id], resultData);
      queryClient.invalidateQueries({ queryKey: ['certification', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['certification', 'study-plan'] });
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
      toast({
        title: 'Đã lưu bộ đề',
        description: 'Bộ sưu tập đã được lưu vào thư viện cá nhân của bạn.',
      });
    },
  });
};

export const useCloneCollection = () => {
  const { toast } = useToast();

  return useMutation<{ cloned: boolean; newCollectionId: string }, Error, string>({
    mutationFn: (id: string) => CertificationApi.cloneCollection(id),
    onSuccess: () => {
      toast({
        title: 'Nhân bản thành công',
        description: 'Bộ sưu tập đã được tạo bản sao vào thư viện cá nhân.',
      });
    },
  });
};

export const useReportCollection = () => {
  const { toast } = useToast();

  return useMutation<{ reported: boolean }, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => CertificationApi.reportCollection(id, reason),
    onSuccess: () => {
      toast({
        title: 'Đã gửi báo cáo',
        description: 'Cảm ơn bạn. Báo cáo của bạn đã được gửi cho ban quản trị xem xét.',
      });
    },
  });
};
