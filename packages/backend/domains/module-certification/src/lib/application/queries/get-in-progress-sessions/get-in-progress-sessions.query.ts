import { Query } from '@nestjs/cqrs';

export class GetInProgressSessionsQuery extends Query<Record<string, unknown>[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
