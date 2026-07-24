import { Query } from '@nestjs/cqrs';

export class GetExamQuery extends Query<Record<string, unknown>> {
  constructor(public readonly id: string) {
    super();
  }
}
