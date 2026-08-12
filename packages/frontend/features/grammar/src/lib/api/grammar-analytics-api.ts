import type {
  GrammarAnalyticsResponse,
  ExamQuestion,
  SaveGrammarTrapDto,
  UserGrammarTrap,
  UserSrsProgress,
} from '../types';

import type { ResourceResponse, ResourceListResponse } from './api-helpers';
import { getAxiosInstance, extractResource, extractCollection } from './api-helpers';

const ENDPOINTS = {
  srsDueQuizzes: '/grammar/practice/srs',
  submitSrs: (quizId: string) => `/grammar/practice/srs/${quizId}/submit`,
  traps: '/grammar/trap-diary',
  breakTrap: (id: string) => `/grammar/trap-diary/${id}/break`,
  aiAnalysis: (id: string) => `/grammar/trap-diary/${id}/ai-analysis`,
  analytics: '/grammar/analytics',
} as const;

export const grammarAnalyticsApi = {
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
