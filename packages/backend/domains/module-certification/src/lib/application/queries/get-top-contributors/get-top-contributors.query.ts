import { Query } from '@nestjs/cqrs';

export class GetTopContributorsQuery extends Query<any[]> {}
