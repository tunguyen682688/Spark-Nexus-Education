export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface QuizResultDetail {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResponse {
  score: number;
  totalQuestions: number;
  correctCount: number;
  results: QuizResultDetail[];
}

export interface ArticleQuizData {
  questions: QuizQuestion[];
}
