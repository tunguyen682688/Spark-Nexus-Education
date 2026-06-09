import { Query } from '@nestjs/cqrs';

export class GetExamSetsQuery extends Query<any> {
  constructor(
    public readonly userId: string,
    public readonly filters: { level?: string; examType?: string; search?: string }
  ) {
    super();
  }
}
