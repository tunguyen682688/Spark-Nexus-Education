import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { GetUsersProfilesQuery } from './get-users-profiles.query';

@QueryHandler(GetUsersProfilesQuery)
export class GetUsersProfilesHandler implements IQueryHandler<GetUsersProfilesQuery, User[]> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: any
  ) {}

  async execute(query: GetUsersProfilesQuery): Promise<User[]> {
    if (!query.ids || query.ids.length === 0) {
      return [];
    }
    return this.userRepository.findByIds(query.ids);
  }
}
