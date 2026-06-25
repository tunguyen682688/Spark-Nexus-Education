import { IQuery } from '@nestjs/cqrs';
import { QueryParams } from '@spark-nest-ed/shared-libs';

export class GetArticlesQuery implements IQuery {
  constructor(
    public readonly queryParams?: QueryParams & { status?: string },
    public readonly userId?: string
  ) {}
}

