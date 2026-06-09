import { IQuery } from '@nestjs/cqrs';

export class GetUserProfileQuery implements IQuery {
  constructor(public readonly id: string) {}
}
