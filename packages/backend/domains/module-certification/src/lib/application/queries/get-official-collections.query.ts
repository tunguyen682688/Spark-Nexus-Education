import { IQuery } from '@nestjs/cqrs';
import { QueryParams } from '@spark-nest-ed/shared-libs';

export class GetOfficialCollectionsQuery implements IQuery {
  constructor(public readonly queryParams?: QueryParams) {}
}
