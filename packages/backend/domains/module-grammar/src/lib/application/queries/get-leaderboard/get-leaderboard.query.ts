import { Query } from '@nestjs/cqrs';

export class GetLeaderboardQuery extends Query<any> {
  constructor(public readonly timeframe: 'week' | 'month' | 'all-time' = 'all-time') {
    super();
  }
}
