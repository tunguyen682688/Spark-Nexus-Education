import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetWeeklyActivityQuery } from './get-weekly-activity.query';
import { ListeningService } from '../../../domain/services/listening.service';

@QueryHandler(GetWeeklyActivityQuery)
export class GetWeeklyActivityQueryHandler implements IQueryHandler<GetWeeklyActivityQuery> {
  constructor(private readonly listeningService: ListeningService) {}

  async execute(query: GetWeeklyActivityQuery) {
    return this.listeningService.getWeeklyActivity(query.userId);
  }
}
