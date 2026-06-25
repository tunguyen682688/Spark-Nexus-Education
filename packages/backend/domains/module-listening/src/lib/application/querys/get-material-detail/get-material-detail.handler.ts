import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetListeningMaterialDetailQuery } from './get-material-detail.query';
import { ListeningService } from '../../../domain/services/listening.service';

@QueryHandler(GetListeningMaterialDetailQuery)
export class GetListeningMaterialDetailQueryHandler implements IQueryHandler<GetListeningMaterialDetailQuery> {
  constructor(
    private readonly listeningService: ListeningService
  ) {}

  async execute(query: GetListeningMaterialDetailQuery) {
    return this.listeningService.getMaterialDetail(query.id, query.userId || '');
  }
}
