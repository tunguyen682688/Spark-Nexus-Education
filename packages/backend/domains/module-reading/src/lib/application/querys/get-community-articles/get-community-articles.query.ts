import { IQuery } from '@nestjs/cqrs';

export class GetCommunityArticlesQuery implements IQuery {
  constructor(
    public readonly sortBy: 'trending' | 'newest' | 'top',
    public readonly limit = 10,
    public readonly userId?: string
  ) {}
}
