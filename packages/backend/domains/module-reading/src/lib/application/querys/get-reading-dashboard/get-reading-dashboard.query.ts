import { IQuery } from '@nestjs/cqrs';

export class GetReadingDashboardQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
