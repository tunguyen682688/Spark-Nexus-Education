import { IQuery } from '@nestjs/cqrs';

export class GetUserStatsQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
