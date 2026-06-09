import { Query } from '@nestjs/cqrs';

export class GetSrsDueQuizzesQuery extends Query<any> {
  constructor(public readonly userId: string) {
    super();
  }
}
