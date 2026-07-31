import { Query } from '@nestjs/cqrs';

export class GetSavedCollectionsQuery extends Query<Record<string, unknown>> {
  constructor(public readonly userId: string) {
    super();
  }
}
