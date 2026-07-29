import { Query } from '@nestjs/cqrs';

export class GetCompletedCollectionsQuery extends Query<Record<string, unknown>[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
