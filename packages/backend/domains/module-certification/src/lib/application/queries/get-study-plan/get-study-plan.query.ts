import { Query } from '@nestjs/cqrs';

export class GetStudyPlanQuery extends Query<any[]> {
  constructor(public readonly userId: string) {
    super();
  }
}
