/**
 * Grammar API – Axios abstraction layer.
 * Provides JSON:API aware helpers that can be reused by React Query hooks.
 */

import type {
  JsonApiResponse,
  JsonApiPaginatedResponse,
  ResourceObject,
} from '@spark-nest-ed/frontend-core-api';

import type {
  GrammarRoadmapResponse,
  SaveGrammarLessonDto,
  GrammarLessonDetailResponse,
  GrammarExamSet,
  CommunityGrammarCertificate,
  SaveGrammarTrapDto,
  UserGrammarTrap,
  GrammarAnalyticsResponse,
  PracticeQuestion,
  CommunityPost,
  CrowdsourcedQuiz,
  ExamQuestion,
  CommunityComment,
  UserGrammarProgress,
  UserDailyStreak,
  UserLevelGraduation,
  UserSrsProgress,
} from '../types';

const ENDPOINTS = {
  roadmap: '/grammar/roadmap',
  lessons: '/grammar/lessons',
  lesson: (id: string) => `/grammar/lessons/${id}`,
  completeLesson: (id: string) => `/grammar/lessons/${id}/complete`,
  updateProgress: (id: string) => `/grammar/lessons/${id}/progress`,
  dailyQuiz: '/grammar/daily-quiz',
  submitDailyQuiz: '/grammar/daily-quiz/submit',
  practiceQuestions: '/grammar/practice/questions',
  submitGraduation: (level: string) => `/grammar/graduation/${level}/submit`,
  leaderboard: '/grammar/leaderboard',
  communityPosts: '/grammar/community/posts',
  communityComments: (postId: string) => `/grammar/community/posts/${postId}/comments`,
  likeCommunityPost: (postId: string) => `/grammar/community/posts/${postId}/like`,
  crowdsourcedQuizzes: (lessonId: string) => `/grammar/lessons/${lessonId}/crowdsourced`,
  upvoteCrowdsourced: (quizId: string) => `/grammar/quizzes/crowdsourced/${quizId}/upvote`,
  srsDueQuizzes: '/grammar/practice/srs',
  submitSrs: (quizId: string) => `/grammar/practice/srs/${quizId}/submit`,
  exams: '/grammar/exams',
  upvoteExam: (id: string) => `/grammar/exams/${id}/upvote`,
  submitExam: (id: string) => `/grammar/exams/${id}/submit`,
  certificates: '/grammar/exams/certificates',
  traps: '/grammar/trap-diary',
  breakTrap: (id: string) => `/grammar/trap-diary/${id}/break`,
  aiAnalysis: (id: string) => `/grammar/trap-diary/${id}/ai-analysis`,
  analytics: '/grammar/analytics',
} as const;

type ResourceResponse<T> =
  | T
  | JsonApiResponse<T>
  | {
      data: ResourceObject<T>;
    }
  | {
      data: T;
    };

type ResourceListResponse<T> =
  | T[]
  | JsonApiPaginatedResponse<T>
  | {
      data: Array<ResourceObject<T>>;
    }
  | {
      data: T[];
    };

const getAxiosInstance = async () => {
  const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
  return getAxiosClient();
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isResourceObject<T>(value: unknown): value is ResourceObject<T> {
  if (!isRecord(value)) return false;
  const candidate = value as { id?: unknown; type?: unknown; attributes?: unknown };
  return typeof candidate.id === 'string' && isRecord(candidate.attributes);
}

function extractResource<T>(payload: ResourceResponse<T>): T {
  if (isRecord(payload) && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (isResourceObject<T>(data)) {
      return {
        ...(data.attributes as T),
        ...(('id' in data && typeof data.id === 'string') ? ({ id: data.id } as Record<string, unknown>) : {}),
      } as T;
    }
    return data as T;
  }
  return payload as T;
}

function extractCollection<T>(payload: ResourceListResponse<T>): T[] {
  if (isRecord(payload) && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data.map((item) => {
        if (isResourceObject<T>(item)) {
          return {
            ...(item.attributes as T),
            ...((item.id && typeof item.id === 'string') ? { id: item.id } : {}),
          } as T;
        }
        return item as T;
      });
    }
  }
  return Array.isArray(payload) ? (payload as T[]) : [];
}

export const grammarApi = {
  async getRoadmap(): Promise<GrammarRoadmapResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<GrammarRoadmapResponse>>(ENDPOINTS.roadmap);
    return extractResource<GrammarRoadmapResponse>(response.data);
  },

  async getLessonDetail(id: string): Promise<GrammarLessonDetailResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<GrammarLessonDetailResponse>>(ENDPOINTS.lesson(id));
    const data = extractResource<GrammarLessonDetailResponse>(response.data);
    
    // Add default values for compatibility with frontend models if properties are missing
    return {
      ...data,
      theory: data.theory || '',
      formula: data.formula || [],
    };
  },

  async createLesson(payload: SaveGrammarLessonDto): Promise<{ success: boolean; data: GrammarLessonDetailResponse }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<GrammarLessonDetailResponse>>(ENDPOINTS.lessons, payload);
    return { success: true, data: extractResource<GrammarLessonDetailResponse>(response.data) };
  },

  async updateLesson(id: string, payload: SaveGrammarLessonDto): Promise<{ success: boolean; data: GrammarLessonDetailResponse }> {
    const axios = await getAxiosInstance();
    const response = await axios.put<ResourceResponse<GrammarLessonDetailResponse>>(ENDPOINTS.lesson(id), payload);
    return { success: true, data: extractResource<GrammarLessonDetailResponse>(response.data) };
  },

  async completeLesson(id: string): Promise<{ success: boolean; data: UserGrammarProgress }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<UserGrammarProgress>>(ENDPOINTS.completeLesson(id));
    return { success: true, data: extractResource<UserGrammarProgress>(response.data) };
  },

  async updateProgress(
    id: string,
    payload: { status?: string; proficiency?: number; quickNotes?: string }
  ): Promise<{ success: boolean; data: UserGrammarProgress }> {
    const axios = await getAxiosInstance();
    const response = await axios.put<ResourceResponse<UserGrammarProgress>>(ENDPOINTS.updateProgress(id), payload);
    return { success: true, data: extractResource<UserGrammarProgress>(response.data) };
  },

  async getDailyQuiz(): Promise<ExamQuestion[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<ExamQuestion[]>>(ENDPOINTS.dailyQuiz);
    return extractResource<ExamQuestion[]>(response.data);
  },

  async submitDailyQuiz(score: number, xpEarned: number): Promise<{ success: boolean; data: UserDailyStreak }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<UserDailyStreak>>(ENDPOINTS.submitDailyQuiz, { score, xpEarned });
    return { success: true, data: extractResource<UserDailyStreak>(response.data) };
  },

  async getPracticeQuestions(filters: { level?: string; category?: string; type?: string }): Promise<PracticeQuestion[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<PracticeQuestion>>(ENDPOINTS.practiceQuestions, { params: filters });
    return extractCollection<PracticeQuestion>(response.data);
  },

  async submitGraduation(level: string, percentage: number): Promise<{ success: boolean; isPassed: boolean; data: UserLevelGraduation }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; isPassed: boolean; data: UserLevelGraduation }>>(ENDPOINTS.submitGraduation(level), { percentage });
    const attributes = extractResource<{ success: boolean; isPassed: boolean; data: UserLevelGraduation }>(response.data);
    return {
      success: attributes.success,
      isPassed: attributes.isPassed,
      data: attributes.data,
    };
  },

  async getLeaderboard(timeframe?: string): Promise<Array<{ id: string; name: string; xp: number; avatar: string; rank: number; isCurrentUser?: boolean }>> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<Array<{ id: string; name: string; xp: number; avatar: string; rank: number; isCurrentUser?: boolean }>>>(ENDPOINTS.leaderboard, { params: { timeframe } });
    return extractResource<Array<{ id: string; name: string; xp: number; avatar: string; rank: number; isCurrentUser?: boolean }>>(response.data);
  },

  async getCommunityPosts(tag?: string, search?: string): Promise<CommunityPost[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<CommunityPost>>(ENDPOINTS.communityPosts, { params: { tag, search } });
    return extractCollection<CommunityPost>(response.data);
  },

  async createCommunityPost(payload: {
    title: string;
    content: string;
    tags: string[];
    hasQuiz?: boolean;
    quizType?: CommunityPost['quizType'];
    quizData?: CommunityPost['quizData'];
  }): Promise<{ success: boolean; data: CommunityPost }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<CommunityPost>>(ENDPOINTS.communityPosts, payload);
    return { success: true, data: extractResource<CommunityPost>(response.data) };
  },

  async addCommunityComment(postId: string, content: string): Promise<{ success: boolean; data: CommunityComment }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<CommunityComment>>(ENDPOINTS.communityComments(postId), { content });
    return { success: true, data: extractResource<CommunityComment>(response.data) };
  },

  async likeCommunityPost(postId: string): Promise<{ success: boolean; likesCount: number }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; likesCount: number }>>(ENDPOINTS.likeCommunityPost(postId));
    const attributes = extractResource<{ success: boolean; likesCount: number }>(response.data);
    return {
      success: attributes.success,
      likesCount: attributes.likesCount,
    };
  },

  async submitCrowdsourcedQuiz(
    lessonId: string,
    payload: { questionType: CrowdsourcedQuiz['questionType']; questionData: CrowdsourcedQuiz['questionData']; explanation: string }
  ): Promise<{ success: boolean; status: string; message: string; data: CrowdsourcedQuiz }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; status: string; message: string; data: CrowdsourcedQuiz }>>(ENDPOINTS.crowdsourcedQuizzes(lessonId), payload);
    const attributes = extractResource<{ success: boolean; status: string; message: string; data: CrowdsourcedQuiz }>(response.data);
    return {
      success: attributes.success,
      status: attributes.status,
      message: attributes.message,
      data: attributes.data,
    };
  },

  async upvoteCrowdsourcedQuiz(quizId: string): Promise<{ success: boolean; upvotes: number; status: string }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; upvotes: number; status: string }>>(ENDPOINTS.upvoteCrowdsourced(quizId));
    const attributes = extractResource<{ success: boolean; upvotes: number; status: string }>(response.data);
    return {
      success: attributes.success,
      upvotes: attributes.upvotes,
      status: attributes.status,
    };
  },

  async getCrowdsourcedQuizzes(lessonId: string): Promise<CrowdsourcedQuiz[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<CrowdsourcedQuiz>>(ENDPOINTS.crowdsourcedQuizzes(lessonId));
    return extractCollection<CrowdsourcedQuiz>(response.data);
  },

  async getSrsDueQuizzes(): Promise<ExamQuestion[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<ExamQuestion>>(ENDPOINTS.srsDueQuizzes);
    return extractCollection<ExamQuestion>(response.data);
  },

  async submitSrsFeedback(quizId: string, isCorrect: boolean): Promise<{ success: boolean; nextReviewDate: string; intervalDays: number; data: UserSrsProgress }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; nextReviewDate: string; intervalDays: number; data: UserSrsProgress }>>(ENDPOINTS.submitSrs(quizId), { isCorrect });
    const attributes = extractResource<{ success: boolean; nextReviewDate: string; intervalDays: number; data: UserSrsProgress }>(response.data);
    return {
      success: attributes.success,
      nextReviewDate: attributes.nextReviewDate,
      intervalDays: attributes.intervalDays,
      data: attributes.data,
    };
  },

  async getExamSets(level?: string, examType?: string, search?: string): Promise<GrammarExamSet[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<GrammarExamSet>>(ENDPOINTS.exams, { params: { level, examType, search } });
    return extractCollection<GrammarExamSet>(response.data);
  },

  async createExamSet(payload: {
    title: string;
    description: string;
    level: string;
    examType: GrammarExamSet['examType'];
    examMetadata?: Record<string, unknown>;
    timeLimit: number;
    questions: ExamQuestion[];
  }): Promise<GrammarExamSet> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<GrammarExamSet>>(ENDPOINTS.exams, payload);
    return extractResource<GrammarExamSet>(response.data);
  },

  async upvoteExamSet(id: string): Promise<{ success: boolean; upvotes: number }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; upvotes: number }>>(ENDPOINTS.upvoteExam(id));
    const attributes = extractResource<{ success: boolean; upvotes: number }>(response.data);
    return {
      success: attributes.success,
      upvotes: attributes.upvotes,
    };
  },

  async submitExamAttempt(
    id: string,
    payload: { correctCount: number; totalCount: number }
  ): Promise<{
    success: boolean;
    proficiency: number;
    isPassed: boolean;
    xpEarned: number;
    newCertificateIssued: boolean;
    certificate: CommunityGrammarCertificate | null;
  }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{
      success: boolean;
      proficiency: number;
      isPassed: boolean;
      xpEarned: number;
      newCertificateIssued: boolean;
      certificate: CommunityGrammarCertificate | null;
    }>>(ENDPOINTS.submitExam(id), payload);
    const attributes = extractResource<{
      success: boolean;
      proficiency: number;
      isPassed: boolean;
      xpEarned: number;
      newCertificateIssued: boolean;
      certificate: CommunityGrammarCertificate | null;
    }>(response.data);
    return {
      success: attributes.success,
      proficiency: attributes.proficiency,
      isPassed: attributes.isPassed,
      xpEarned: attributes.xpEarned,
      newCertificateIssued: attributes.newCertificateIssued,
      certificate: attributes.certificate,
    };
  },

  async getUserCertificates(): Promise<CommunityGrammarCertificate[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<CommunityGrammarCertificate>>(ENDPOINTS.certificates);
    return extractCollection<CommunityGrammarCertificate>(response.data);
  },

  async saveGrammarTrap(payload: SaveGrammarTrapDto): Promise<{ success: boolean; data: UserGrammarTrap }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; data: UserGrammarTrap }>>(ENDPOINTS.traps, payload);
    const attributes = extractResource<{ success: boolean; data: UserGrammarTrap }>(response.data);
    return {
      success: attributes.success,
      data: attributes.data,
    };
  },

  async getGrammarTraps(status?: string): Promise<UserGrammarTrap[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<UserGrammarTrap>>(ENDPOINTS.traps, { params: { status } });
    return extractCollection<UserGrammarTrap>(response.data);
  },

  async breakGrammarTrap(id: string): Promise<{ success: boolean; xpEarned: number; data: UserGrammarTrap | undefined }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; xpEarned: number; data: UserGrammarTrap | undefined }>>(ENDPOINTS.breakTrap(id));
    const attributes = extractResource<{ success: boolean; xpEarned: number; data: UserGrammarTrap | undefined }>(response.data);
    return {
      success: attributes.success,
      xpEarned: attributes.xpEarned,
      data: attributes.data,
    };
  },

  async generateAiTrapAnalysis(id: string): Promise<{ success: boolean; aiAnalysis: string; data: UserGrammarTrap | null }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; aiAnalysis: string; data: UserGrammarTrap | null }>>(ENDPOINTS.aiAnalysis(id));
    const attributes = extractResource<{ success: boolean; aiAnalysis: string; data: UserGrammarTrap | null }>(response.data);
    return {
      success: attributes.success,
      aiAnalysis: attributes.aiAnalysis,
      data: attributes.data,
    };
  },

  async getAnalyticsSummary(): Promise<GrammarAnalyticsResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<GrammarAnalyticsResponse>>(ENDPOINTS.analytics);
    return extractResource<GrammarAnalyticsResponse>(response.data);
  },
};
