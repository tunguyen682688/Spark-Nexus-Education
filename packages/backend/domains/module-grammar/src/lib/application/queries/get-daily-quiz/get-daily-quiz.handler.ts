import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDailyQuizQuery } from './get-daily-quiz.query';
import { DAILY_QUIZ_POOL } from '../../../common/constants/grammar-questions.constants';

@QueryHandler(GetDailyQuizQuery)
export class GetDailyQuizHandler implements IQueryHandler<GetDailyQuizQuery, any> {
  async execute(query: GetDailyQuizQuery): Promise<any> {
    return DAILY_QUIZ_POOL;
  }
}

