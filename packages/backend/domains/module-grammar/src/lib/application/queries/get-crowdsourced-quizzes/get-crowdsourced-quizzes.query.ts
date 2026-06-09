import { Query } from '@nestjs/cqrs';

export class GetCrowdsourcedQuizzesQuery extends Query<any> {
  constructor(public readonly lessonId: string) {
    super();
  }
}
