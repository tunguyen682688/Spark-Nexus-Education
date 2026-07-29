import { Query } from '@nestjs/cqrs';

export class GetPurchasedCollectionsQuery extends Query<Record<string, unknown>[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
