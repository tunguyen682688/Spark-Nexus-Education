export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export const READING_QUIZ_SERVICE = Symbol('READING_QUIZ_SERVICE');

export interface IReadingQuizService {
  /**
   * Returns quiz questions for a given article title.
   * If not static, generates template questions based on the article category and difficulty.
   */
  getQuizForArticle(title: string, category: string, difficulty: string): QuizQuestion[];
}
