import type {
  ApiQueryParams,
  JsonApiPaginatedResponse,
  JsonApiResponse,
  ResourceObject,
  SimplifiedPaginatedResponse,
} from '@spark-nest-ed/frontend-core-api';

import type {
  Article,
  ReadingProgress,
  ReadingDashboardData,
  CreateArticlePayload,
  VocabularySet,
  WordFull,
  VocabularySetItem,
  AddWordToPackagePayload,
  ArticleQuizData,
  QuizResponse,
} from '../types';

const ENDPOINTS = {
  dashboard: '/reading/dashboard',
  articles: '/reading/articles',
  article: (id: string) => `/reading/articles/${id}`,
  progress: (id: string) => `/reading/articles/${id}/progress`,
  communityArticles: '/reading/articles/community/list',
  createCommunityArticle: '/reading/articles/community',
  interactArticle: (id: string) => `/reading/articles/${id}/vote`,
  commentArticle: (id: string) => `/reading/articles/${id}/comment`,
  // Studio endpoints
  studioCreate: '/reading/articles/studio',
  studioUpdate: (id: string) => `/reading/articles/${id}`,
  studioDraft: (id: string) => `/reading/articles/${id}/draft`,
  studioDelete: (id: string) => `/reading/articles/${id}/delete`,
  myArticles: '/reading/articles/my/list',
  quiz: (id: string) => `/reading/articles/${id}/quiz`,
  submitQuiz: (id: string) => `/reading/articles/${id}/quiz/submit`,
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

type JsonApiListResponse<T> = JsonApiPaginatedResponse<T>;

const getAxiosInstance = async () => {
  const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
  return getAxiosClient();
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isResourceObject<T>(value: unknown): value is ResourceObject<T> {
  if (!isRecord(value)) {
    return false;
  }

  const candidate = value as {
    id?: unknown;
    type?: unknown;
    attributes?: unknown;
  };

  return (
    typeof candidate.id === 'string' &&
    isRecord(candidate.attributes)
  );
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

function extractPaginatedResponse<T>(
  response: JsonApiListResponse<T>
): SimplifiedPaginatedResponse<T> {
  const meta =
    response.meta?.pagination ?? ({
      page: 1,
      limit: response.data.length,
      total: response.data.length,
      totalPages: 1,
    } as SimplifiedPaginatedResponse<T>['meta']);

  return {
    data: response.data.map((item) => ({
      ...item.attributes,
      ...(item.id ? { id: item.id } : {}),
    })),
    meta: {
      ...meta,
      hasNext: response.links?.next != null,
      hasPrev: response.links?.prev != null,
    },
    links: response.links,
  };
}

function buildQueryString(params?: ApiQueryParams): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.append('page', String(params.page));
  if (params.pageSize !== undefined) {
    searchParams.append('pageSize', String(params.pageSize));
  } else if (params.limit !== undefined) {
    searchParams.append('limit', String(params.limit));
  }
  if (params.offset !== undefined) searchParams.append('offset', String(params.offset));

  if (params.sortBy) {
    searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) {
      searchParams.append('sortDirection', params.sortOrder);
    }
  }

  const searchQuery = params.search ?? params.q;
  if (searchQuery) {
    searchParams.append('search', searchQuery);
  }

  // Simple filters
  if (params.filters && !Array.isArray(params.filters)) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      searchParams.append(key, String(value));
    });
  }

  const queryString = searchParams.toString();
  return queryString.trim().length > 0 ? `?${queryString}` : '';
}

function serializeContent(content: unknown): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  try {
    return JSON.stringify(content);
  } catch (e) {
    console.error('Failed to stringify content', e);
    return '';
  }
}

export const readingApi = {
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

  // ── Studio API Methods ──────────────────────────────────────

  async createStudioArticle(payload: CreateArticlePayload): Promise<Article> {
    const axios = await getAxiosInstance();
    const formattedPayload = {
      ...payload,
      content: serializeContent(payload.content),
    };
    const response = await axios.post<ResourceResponse<Article>>(ENDPOINTS.studioCreate, formattedPayload);
    return extractResource(response.data);
  },

  async updateArticle(id: string, payload: Partial<CreateArticlePayload>): Promise<Article> {
    const axios = await getAxiosInstance();
    const formattedPayload = {
      ...payload,
      content: payload.content !== undefined ? serializeContent(payload.content) : undefined,
    };
    const response = await axios.put<ResourceResponse<Article>>(ENDPOINTS.studioUpdate(id), formattedPayload);
    return extractResource(response.data);
  },

  async saveDraft(id: string, payload: Partial<CreateArticlePayload>): Promise<Article> {
    const axios = await getAxiosInstance();
    const formattedPayload = {
      ...payload,
      content: payload.content !== undefined ? serializeContent(payload.content) : undefined,
    };
    const response = await axios.put<ResourceResponse<Article>>(ENDPOINTS.studioDraft(id), formattedPayload);
    return extractResource(response.data);
  },

  async deleteArticle(id: string): Promise<void> {
    const axios = await getAxiosInstance();
    await axios.post(ENDPOINTS.studioDelete(id));
  },

  async getMyArticles(params?: ApiQueryParams): Promise<SimplifiedPaginatedResponse<Article>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<Article>>(
      `${ENDPOINTS.myArticles}${queryString}`
    );
    return extractPaginatedResponse(response.data);
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

  async getArticleQuiz(articleId: string): Promise<ArticleQuizData> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<ArticleQuizData>>(ENDPOINTS.quiz(articleId));
    return extractResource(response.data);
  },

  async submitArticleQuiz(articleId: string, answers: Record<string, string>): Promise<QuizResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<QuizResponse>>(ENDPOINTS.submitQuiz(articleId), {
      answers,
    });
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

  async parseSyntax(sentence: string): Promise<{
    label: string;
    text?: string;
    children?: any[];
  }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{
      label: string;
      text?: string;
      children?: any[];
    }>>('/reading/parse-syntax', { sentence });
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
