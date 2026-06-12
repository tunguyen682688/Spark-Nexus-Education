import { IQuery } from '@nestjs/cqrs';

export class GetCommunityArticlesQuery implements IQuery {
  constructor(
    public readonly sortBy: 'trending' | 'newest' | 'top' = 'trending',
    public readonly limit: number = 10,
    public readonly userId?: string
  ) {}
}
