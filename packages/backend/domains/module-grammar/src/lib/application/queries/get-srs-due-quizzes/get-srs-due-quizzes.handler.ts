import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetSrsDueQuizzesQuery } from './get-srs-due-quizzes.query';
import { Inject } from '@nestjs/common';
import { GRAMMAR_SRS_REPOSITORY } from '../../../domain/repositories/grammar-srs.repository.interface';
import type { IGrammarSrsRepository } from '../../../domain/repositories/grammar-srs.repository.interface';
import { SRS_QUIZ_POOL } from '../../../common/constants/grammar-questions.constants';

@QueryHandler(GetSrsDueQuizzesQuery)
export class GetSrsDueQuizzesHandler implements IQueryHandler<GetSrsDueQuizzesQuery, any> {
  constructor(
    @Inject(GRAMMAR_SRS_REPOSITORY)
    private readonly srsRepository: IGrammarSrsRepository
  ) {}

  async execute(query: GetSrsDueQuizzesQuery): Promise<any> {
    const { userId } = query;
    const now = new Date();

    const dueProgress = await this.srsRepository.findDueProgress(userId, now);

    const defaultSrsPool = SRS_QUIZ_POOL;


    if (dueProgress.length === 0) {
      return defaultSrsPool;
    }

    const dueIds = dueProgress.map(p => p.quizId);
    const filtered = defaultSrsPool.filter(q => dueIds.includes(q.id));

    return filtered.length > 0 ? filtered : defaultSrsPool;
  }
}
