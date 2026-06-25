import { IQuery } from '@nestjs/cqrs';
import { GetListeningMaterialsQueryDto } from '../../dtos/get-materials-query.dto';

export class GetListeningMaterialsQuery implements IQuery {
  constructor(
    public readonly dto: GetListeningMaterialsQueryDto,
    public readonly userId?: string
  ) {}
}
