import type {
  ApiQueryParams,
  SimplifiedPaginatedResponse,
} from '@spark-nest-ed/frontend-core-api';

import type {
  Article,
  ReadingProgress,
  ReadingDashboardData,
  VocabularySet,
  WordFull,
  VocabularySetItem,
  AddWordToPackagePayload,
  SyntaxNode,
} from '../types';

import type { ResourceResponse, JsonApiListResponse } from './api-helpers';
import {
  getAxiosInstance,
  extractResource,
  extractPaginatedResponse,
  buildQueryString,
} from './api-helpers';

const ENDPOINTS = {
  dashboard: '/reading/dashboard',
  articles: '/reading/articles',
  article: (id: string) => `/reading/articles/${id}`,
  progress: (id: string) => `/reading/articles/${id}/progress`,
  communityArticles: '/reading/articles/community/list',
  interactArticle: (id: string) => `/reading/articles/${id}/vote`,
} as const;

export const readingArticlesApi = {
  async getDashboard(): Promise<ReadingDashboardData> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<ReadingDashboardData>>(ENDPOINTS.dashboard);
    return extractResource(response.data);
  },

  async getArticles(
    params?: ApiQueryParams
  ): Promise<SimplifiedPaginatedResponse<Article>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<Article>>(
      `${ENDPOINTS.articles}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },

  async getArticle(id: string): Promise<Article> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<Article>>(ENDPOINTS.article(id));
    return extractResource(response.data);
  },

  async updateProgress(
    id: string,
    payload: { progress: number; lastPosition: number; timeSpent: number }
  ): Promise<ReadingProgress> {
    const axios = await getAxiosInstance();
    const response = await axios.put<ResourceResponse<ReadingProgress>>(
      ENDPOINTS.progress(id),
      payload
    );
    return extractResource(response.data);
  },

  async getCommunityArticles(
    sortBy: 'trending' | 'newest' | 'top',
    limit = 10
  ): Promise<SimplifiedPaginatedResponse<Article>> {
    const axios = await getAxiosInstance();
    const response = await axios.get<JsonApiListResponse<Article>>(
      `${ENDPOINTS.communityArticles}?sortBy=${sortBy}&limit=${limit}`
    );
    return extractPaginatedResponse(response.data);
  },

  async interactArticle(id: string, action: 'UPVOTE' | 'DOWNVOTE' | 'BOOKMARK'): Promise<{ id: string; action: string }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ id: string; action: string }>>(
      ENDPOINTS.interactArticle(id),
      { action }
    );
    return extractResource(response.data);
  },

  async getEntryDetail(word: string): Promise<WordFull> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<WordFull>>(`/vocabulary/entries/${word.toLowerCase().trim()}`);
    return extractResource(response.data);
  },

  async translateContext(word: string, sentence: string): Promise<{ translation: string; explanation: string }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ translation: string; explanation: string }>>('/reading/translate-context', {
      word,
      sentence,
    });
    return extractResource(response.data);
  },

  async getUserVocabularyPackages(params?: ApiQueryParams): Promise<SimplifiedPaginatedResponse<VocabularySet>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<VocabularySet>>(
      `/vocabulary/packages/my/created${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },

  async addWordToPackage(packageId: string, payload: AddWordToPackagePayload): Promise<VocabularySetItem> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<VocabularySetItem>>(`/vocabulary/packages/${packageId}/words`, payload);
    return extractResource(response.data);
  },

  async getWeakWords(): Promise<Array<{
    id: string;
    word: string;
    pronunciation: string | null;
    partOfSpeech: string | null;
    audioUrl: string | null;
    definition: string;
    example: string | null;
    masteryLevel: number;
    status: string;
  }>> {
    const axios = await getAxiosInstance();
    const response = await axios.get<JsonApiListResponse<{
      id: string;
      word: string;
      pronunciation: string | null;
      partOfSpeech: string | null;
      audioUrl: string | null;
      definition: string;
      example: string | null;
      masteryLevel: number;
      status: string;
    }>>('/vocabulary/weak-words');
    return extractPaginatedResponse(response.data).data;
  },

  async parseSyntax(sentence: string): Promise<SyntaxNode> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<SyntaxNode>>('/reading/parse-syntax', { sentence });
    return extractResource(response.data);
  },

  async createVocabularyPackage(payload: { title: string; language: string; type: string }): Promise<VocabularySet> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<VocabularySet>>('/vocabulary/packages', payload);
    return extractResource(response.data);
  },

  async translateParagraph(text: string): Promise<{ translation: string }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ translation: string }>>('/reading/translate-paragraph', {
      text,
    });
    return extractResource(response.data);
  },
};
