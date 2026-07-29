import { Query } from '@nestjs/cqrs';

export class GetBookmarksQuery extends Query<Record<string, unknown>[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
