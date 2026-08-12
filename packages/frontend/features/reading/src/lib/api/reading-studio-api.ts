import type {
  ApiQueryParams,
  SimplifiedPaginatedResponse,
} from '@spark-nest-ed/frontend-core-api';

import type {
  Article,
  CreateArticlePayload,
} from '../types';

import type { ResourceResponse, JsonApiListResponse } from './api-helpers';
import {
  getAxiosInstance,
  extractResource,
  extractPaginatedResponse,
  buildQueryString,
  serializeContent,
} from './api-helpers';

const ENDPOINTS = {
  studioCreate: '/reading/articles/studio',
  studioUpdate: (id: string) => `/reading/articles/${id}`,
  studioDraft: (id: string) => `/reading/articles/${id}/draft`,
  studioDelete: (id: string) => `/reading/articles/${id}/delete`,
  myArticles: '/reading/articles/my/list',
} as const;

export const readingStudioApi = {
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
    await axios.post<unknown>(ENDPOINTS.studioDelete(id));
  },

  async getMyArticles(params?: ApiQueryParams): Promise<SimplifiedPaginatedResponse<Article>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<Article>>(
      `${ENDPOINTS.myArticles}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },
};
