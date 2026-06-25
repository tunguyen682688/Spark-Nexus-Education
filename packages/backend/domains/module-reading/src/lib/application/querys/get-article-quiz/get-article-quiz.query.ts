import { Query } from '@nestjs/cqrs';

export interface GetArticleQuizResult {
  id: string;
  articleId: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
  }>;
}

export class GetArticleQuizQuery extends Query<GetArticleQuizResult> {
  constructor(
    public readonly articleId: string,
    public readonly userId: string
  ) {
    super();
  }
}
