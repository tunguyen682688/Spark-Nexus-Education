import { Command } from '@nestjs/cqrs';

export interface SubmitArticleQuizResult {
  id: string;
  articleId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  results: Array<{
    questionId: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string | null;
  }>;
}

export class SubmitArticleQuizCommand extends Command<SubmitArticleQuizResult> {
  constructor(
    public readonly userId: string,
    public readonly articleId: string,
    public readonly answers: Record<string, string>
  ) {
    super();
  }
}
