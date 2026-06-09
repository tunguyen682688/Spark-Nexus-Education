import { Query } from '@nestjs/cqrs';

export class GetCommunityPostsQuery extends Query<any> {
  constructor(
    public readonly tag?: string,
    public readonly search?: string
  ) {
    super();
  }
}
