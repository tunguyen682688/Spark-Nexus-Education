import { Query } from '@nestjs/cqrs';

export class GetCollectionQuery extends Query<Record<string, unknown>> {
  constructor(public readonly id: string) {
    super();
  }
}
