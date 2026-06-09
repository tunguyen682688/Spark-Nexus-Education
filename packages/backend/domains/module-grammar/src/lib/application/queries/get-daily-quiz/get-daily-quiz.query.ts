import { Query } from '@nestjs/cqrs';

export class GetDailyQuizQuery extends Query<any> {
  constructor() {
    super();
  }
}
