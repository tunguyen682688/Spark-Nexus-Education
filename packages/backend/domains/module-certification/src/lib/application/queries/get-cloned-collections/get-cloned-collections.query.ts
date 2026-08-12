import { Query } from '@nestjs/cqrs';

export class GetClonedCollectionsQuery extends Query<Record<string, unknown>> {
  constructor(public readonly userId: string) {
    super();
  }
}
