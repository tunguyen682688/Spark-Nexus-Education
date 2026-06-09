import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user.entity';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { GetUserProfileQuery } from './get-user-profile.query';

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery, User> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: any
  ) {}

  async execute(query: GetUserProfileQuery): Promise<User> {
    const user = await this.userRepository.findById(query.id);
    if (!user) {
      throw new NotFoundException(`User with ID ${query.id} not found`);
    }
    return user;
  }
}
