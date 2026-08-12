import type {
  FlashcardSessionResponse,
  UserVocabularyProgressResponse,
} from '../types';

import {
  ENDPOINTS,
  getAxiosInstance,
  extractResource,
  type ResourceResponse,
} from './api-helpers';

export const vocabularyFlashcardApi = {
  async getFlashcardSession(setId: string, reviewAll?: boolean): Promise<FlashcardSessionResponse> {
    const axios = await getAxiosInstance();
    const url = reviewAll ? `${ENDPOINTS.flashcardSession(setId)}?reviewAll=true` : ENDPOINTS.flashcardSession(setId);
    const response = await axios.get<ResourceResponse<FlashcardSessionResponse>>(url);
    return extractResource(response.data);
  },
  async reviewFlashcard(
    setId: string,
    itemId: string,
    quality: number
  ): Promise<UserVocabularyProgressResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<UserVocabularyProgressResponse>>(
      ENDPOINTS.flashcardReview(setId),
      { itemId, quality }
    );
    return extractResource(response.data);
  },
};
