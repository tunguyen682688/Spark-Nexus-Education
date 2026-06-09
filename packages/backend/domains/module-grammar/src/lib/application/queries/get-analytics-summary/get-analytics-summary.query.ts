import { Query } from '@nestjs/cqrs';

export class GetAnalyticsSummaryQuery extends Query<any> {
  constructor(public readonly userId: string) {
    super();
  }
}
