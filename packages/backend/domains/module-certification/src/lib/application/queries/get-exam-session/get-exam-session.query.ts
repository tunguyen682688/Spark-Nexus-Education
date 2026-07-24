import { Query } from '@nestjs/cqrs';

export class GetExamSessionQuery extends Query<Record<string, unknown>> {
  constructor(public readonly sessionId: string) {
    super();
  }
}
