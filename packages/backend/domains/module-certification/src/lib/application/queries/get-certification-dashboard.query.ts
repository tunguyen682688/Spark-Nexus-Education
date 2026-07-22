import { IQuery } from '@nestjs/cqrs';

export class GetCertificationDashboardQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
