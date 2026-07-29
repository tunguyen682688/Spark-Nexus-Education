import { Query } from '@nestjs/cqrs';

interface TopContributor {
  id: string;
  rank: number;
  name: string;
  bio: string;
  userId: string;
  status: string;
  createdAt: Date;
}

export class GetTopContributorsQuery extends Query<TopContributor[]> {}
