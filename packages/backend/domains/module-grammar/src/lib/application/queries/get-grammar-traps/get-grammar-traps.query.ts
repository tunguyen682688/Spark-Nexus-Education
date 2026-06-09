import { Query } from '@nestjs/cqrs';

export class GetGrammarTrapsQuery extends Query<any> {
  constructor(
    public readonly userId: string,
    public readonly status?: string
  ) {
    super();
  }
}
