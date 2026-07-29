import { Query } from '@nestjs/cqrs';

export class GetPracticeHistoryQuery extends Query<Record<string, unknown>[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
