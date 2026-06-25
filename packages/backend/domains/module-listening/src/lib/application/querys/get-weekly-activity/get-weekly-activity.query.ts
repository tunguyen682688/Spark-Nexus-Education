import { IQuery } from '@nestjs/cqrs';

export class GetWeeklyActivityQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
