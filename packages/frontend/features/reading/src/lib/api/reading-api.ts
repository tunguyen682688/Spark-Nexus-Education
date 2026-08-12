import { readingArticlesApi } from './reading-articles-api';
import { readingStudioApi } from './reading-studio-api';
import { readingQuizApi } from './reading-quiz-api';

export const readingApi = {
  ...readingArticlesApi,
  ...readingStudioApi,
  ...readingQuizApi,
};
