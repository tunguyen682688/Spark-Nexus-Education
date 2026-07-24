import { Query } from '@nestjs/cqrs';

export class GetExamResultQuery extends Query<Record<string, unknown>> {
  constructor(public readonly resultId: string) {
    super();
  }
}
