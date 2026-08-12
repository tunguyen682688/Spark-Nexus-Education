import { grammarLessonsApi } from './grammar-lessons-api';
import { grammarExamsApi } from './grammar-exams-api';
import { grammarCommunityApi } from './grammar-community-api';
import { grammarAnalyticsApi } from './grammar-analytics-api';

export const grammarApi = {
  ...grammarLessonsApi,
  ...grammarExamsApi,
  ...grammarCommunityApi,
  ...grammarAnalyticsApi,
};
