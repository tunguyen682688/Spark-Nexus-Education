import { IQuery } from '@nestjs/cqrs';

export class GetStudyPlanQuery implements IQuery {
  constructor(public readonly userId: string) {}
}
