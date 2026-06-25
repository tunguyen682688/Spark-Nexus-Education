import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserStatsQuery } from './get-user-stats.query';
import { ListeningService } from '../../../domain/services/listening.service';

@QueryHandler(GetUserStatsQuery)
export class GetUserStatsQueryHandler implements IQueryHandler<GetUserStatsQuery> {
  constructor(private readonly listeningService: ListeningService) {}

  async execute(query: GetUserStatsQuery) {
    return this.listeningService.getUserStats(query.userId);
  }
}
