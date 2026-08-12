import type {
  ApiQueryParams,
  SimplifiedPaginatedResponse,
} from '@spark-nest-ed/frontend-core-api';

import type {
  CreateVocabularySetDto,
  UpdateVocabularySetDto,
  AddWordToSetDto,
  SyncVocabularySetItemsDto,
  VocabularySet,
  VocabularySetItem,
  Word,
} from '../types';

import {
  ENDPOINTS,
  getAxiosInstance,
  extractResource,
  extractPaginatedResponse,
  buildQueryString,
  type ResourceResponse,
  type JsonApiListResponse,
} from './api-helpers';

type CreateSetResponse = ResourceResponse<VocabularySet>;

export const vocabularySetsApi = {
  async createSet(payload: CreateVocabularySetDto): Promise<VocabularySet> {
    const axios = await getAxiosInstance();
    const response = await axios.post<CreateSetResponse>(ENDPOINTS.sets, payload);
    return extractResource(response.data);
  },
  async getVocabularySet(setId: string): Promise<VocabularySet> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<VocabularySet>>(ENDPOINTS.set(setId));
    return extractResource(response.data);
  },
  async getSetWords(
    setId: string,
    params?: ApiQueryParams
  ): Promise<SimplifiedPaginatedResponse<VocabularySetItem>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<VocabularySetItem>>(
      `${ENDPOINTS.setWords(setId)}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },
  async getEntryDetail(entryId: string): Promise<Word> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceResponse<Word>>(ENDPOINTS.entry(entryId));
    return extractResource(response.data);
  },
  async getMyCreatedSets(
    params?: ApiQueryParams
  ): Promise<SimplifiedPaginatedResponse<VocabularySet>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<VocabularySet>>(
      `${ENDPOINTS.myCreatedSets}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },
  async getMyFavorites(
    params?: ApiQueryParams
  ): Promise<SimplifiedPaginatedResponse<VocabularySet>> {
    const axios = await getAxiosInstance();
    const queryString = buildQueryString(params);
    const response = await axios.get<JsonApiListResponse<VocabularySet>>(
      `${ENDPOINTS.myFavorites}${queryString}`
    );
    return extractPaginatedResponse(response.data);
  },
  async updateSet(
    setId: string,
    payload: UpdateVocabularySetDto
  ): Promise<VocabularySet> {
    const axios = await getAxiosInstance();
    const response = await axios.put<ResourceResponse<VocabularySet>>(
      ENDPOINTS.set(setId),
      payload
    );
    return extractResource(response.data);
  },
  async syncSetItems(
    setId: string,
    payload: SyncVocabularySetItemsDto,
    config?: Record<string, unknown>
  ): Promise<void> {
    const axios = await getAxiosInstance();
    await axios.put<unknown>(ENDPOINTS.setItems(setId), payload, config);
  },
  async addWordToSet(
    setId: string,
    payload: AddWordToSetDto
  ): Promise<VocabularySetItem> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<VocabularySetItem>>(
      ENDPOINTS.setWords(setId),
      payload
    );
    return extractResource(response.data);
  },
  async updateWordInSet(
    setId: string,
    wordId: string,
    payload: Partial<AddWordToSetDto>
  ): Promise<VocabularySetItem> {
    const axios = await getAxiosInstance();
    const response = await axios.put<ResourceResponse<VocabularySetItem>>(
      ENDPOINTS.setWord(setId, wordId),
      payload
    );
    return extractResource(response.data);
  },
  async deleteWordFromSet(setId: string, wordId: string): Promise<void> {
    const axios = await getAxiosInstance();
    await axios.delete<unknown>(ENDPOINTS.setWord(setId, wordId));
  },
  async deleteVocabularySet(setId: string): Promise<void> {
    const axios = await getAxiosInstance();
    await axios.delete<unknown>(ENDPOINTS.set(setId));
  },
};
