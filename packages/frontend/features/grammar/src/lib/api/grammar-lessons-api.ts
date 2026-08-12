import type {
  GrammarRoadmapResponse,
  SaveGrammarLessonDto,
  GrammarLessonDetailResponse,
  ExamQuestion,
  PracticeQuestion,
  UserGrammarProgress,
  UserDailyStreak,
  UserLevelGraduation,
} from '../types';

import type { ResourceResponse, ResourceListResponse } from './api-helpers';
import { getAxiosInstance, extractResource, extractCollection } from './api-helpers';

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
} as const;

export const grammarLessonsApi = {
  async getRoadmap(): Promise<GrammarRoadmapResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<GrammarRoadmapResponse>>(ENDPOINTS.roadmap);
    return extractResource<GrammarRoadmapResponse>(response.data);
  },

  async getLessonDetail(id: string): Promise<GrammarLessonDetailResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<GrammarLessonDetailResponse>>(ENDPOINTS.lesson(id));
    const data = extractResource<GrammarLessonDetailResponse>(response.data);

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
};
