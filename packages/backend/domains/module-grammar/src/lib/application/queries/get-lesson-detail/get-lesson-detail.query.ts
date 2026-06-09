import { Query } from '@nestjs/cqrs';

export class GetLessonDetailQuery extends Query<any> {
  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {
    super();
  }
}
