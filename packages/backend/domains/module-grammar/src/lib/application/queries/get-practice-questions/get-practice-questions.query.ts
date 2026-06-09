import { Query } from '@nestjs/cqrs';

export class GetPracticeQuestionsQuery extends Query<any> {
  constructor(
    public readonly userId: string,
    public readonly filters: { level?: string; category?: string; type?: string }
  ) {
    super();
  }
}
