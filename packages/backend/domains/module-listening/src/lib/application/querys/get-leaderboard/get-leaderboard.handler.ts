import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetListeningLeaderboardQuery } from './get-leaderboard.query';
import { ListeningService } from '../../../domain/services/listening.service';

@QueryHandler(GetListeningLeaderboardQuery)
export class GetListeningLeaderboardQueryHandler implements IQueryHandler<GetListeningLeaderboardQuery> {
  constructor(private readonly listeningService: ListeningService) {}

  async execute(query: GetListeningLeaderboardQuery) {
    return this.listeningService.getLeaderboard(query.limit);
  }
}
