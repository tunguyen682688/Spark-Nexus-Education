import { Query } from '@nestjs/cqrs';

export class GetCertificationDashboardQuery extends Query<Record<string, unknown>> {
  constructor(public readonly userId: string) {
    super();
  }
}
