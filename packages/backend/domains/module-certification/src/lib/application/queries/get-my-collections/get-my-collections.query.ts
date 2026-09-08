import { Query } from '@nestjs/cqrs';

export class GetMyCollectionsQuery extends Query<Record<string, unknown>> {
  constructor(public readonly userId: string) {
    super();
  }
}
