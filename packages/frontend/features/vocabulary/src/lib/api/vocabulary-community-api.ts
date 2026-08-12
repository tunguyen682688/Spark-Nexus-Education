import type {
  ApiQueryParams,
  SimplifiedPaginatedResponse,
} from '@spark-nest-ed/frontend-core-api';

import type { CommunityVocabularySet } from '../types';

import {
  ENDPOINTS,
  getAxiosInstance,
  extractResource,
  extractPaginatedResponse,
  buildQueryString,
  type ResourceResponse,
  type JsonApiListResponse,
} from './api-helpers';

export const vocabularyCommunityApi = {
  async getCommunitySets(
    params?: ApiQueryParams
  ): Promise<SimplifiedPaginatedResponse<CommunityVocabularySet>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<CommunityVocabularySet>>(
      `${ENDPOINTS.communitySets}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },
  async getCommunitySet(setId: string): Promise<CommunityVocabularySet> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<CommunityVocabularySet>>(ENDPOINTS.communitySet(setId));
    return extractResource(response.data);
  },
  async toggleCommunityFavorite(setId: string, shouldFavorite: boolean): Promise<void> {
    const axios = await getAxiosInstance();
    const endpoint = ENDPOINTS.communityFavorite(setId);
    if (shouldFavorite) {
      await axios.post<unknown>(endpoint);
    } else {
      await axios.delete<unknown>(endpoint);
    }
  },
};
