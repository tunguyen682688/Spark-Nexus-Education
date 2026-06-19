import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetArticleQuizQuery } from './get-article-quiz.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { READING_REPOSITORY } from '../../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';
import { READING_QUIZ_SERVICE } from '../../../domain/services/reading-quiz.service.interface';
import type { IReadingQuizService } from '../../../domain/services/reading-quiz.service.interface';

@QueryHandler(GetArticleQuizQuery)
export class GetArticleQuizQueryHandler implements IQueryHandler<GetArticleQuizQuery> {
  constructor(
    @Inject(READING_REPOSITORY)
    private readonly repository: IReadingRepository,
    @Inject(READING_QUIZ_SERVICE)
    private readonly quizService: IReadingQuizService
  ) {}

  async execute(query: GetArticleQuizQuery) {
    const { articleId } = query;
    const article = await this.repository.findArticleById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    const questions = this.quizService.getQuizForArticle(
      article.getTitle(),
      article.getCategory(),
      article.getDifficulty().getValue()
    );

    // Strip answers from questions to prevent cheating in frontend
    const clientQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

    return {
      id: articleId,
      articleId,
      questions: clientQuestions
    };
  }
}
