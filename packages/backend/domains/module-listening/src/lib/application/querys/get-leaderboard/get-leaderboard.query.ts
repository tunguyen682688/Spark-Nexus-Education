import { IQuery } from '@nestjs/cqrs';

export class GetListeningLeaderboardQuery implements IQuery {
  constructor(public readonly limit = 5) {}
}
