import type {
  ArticleQuizData,
  QuizResponse,
} from '../types';

import type { ResourceResponse } from './api-helpers';
import { getAxiosInstance, extractResource } from './api-helpers';

const ENDPOINTS = {
  quiz: (id: string) => `/reading/articles/${id}/quiz`,
  submitQuiz: (id: string) => `/reading/articles/${id}/quiz/submit`,
} as const;

export const readingQuizApi = {
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
};
