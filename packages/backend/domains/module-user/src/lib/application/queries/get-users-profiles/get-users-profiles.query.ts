import { IQuery } from '@nestjs/cqrs';

export class GetUsersProfilesQuery implements IQuery {
  constructor(public readonly ids: string[]) {}
}
