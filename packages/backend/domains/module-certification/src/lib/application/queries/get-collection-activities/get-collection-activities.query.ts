import { Query } from '@nestjs/cqrs';

export class GetCollectionActivitiesQuery extends Query<Record<string, unknown>[]> {
  constructor(
    public readonly collectionId: string,
    public readonly limit = 10
  ) {
    super();
  }
}
