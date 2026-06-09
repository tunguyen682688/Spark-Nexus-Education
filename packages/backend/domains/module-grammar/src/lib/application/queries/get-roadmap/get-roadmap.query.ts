import { Query } from '@nestjs/cqrs';

export class GetRoadmapQuery extends Query<any> {
  constructor(public readonly userId: string) {
    super();
  }
}
