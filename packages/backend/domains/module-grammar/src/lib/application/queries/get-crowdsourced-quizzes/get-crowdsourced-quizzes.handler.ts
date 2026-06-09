import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCrowdsourcedQuizzesQuery } from './get-crowdsourced-quizzes.query';
import { Inject } from '@nestjs/common';
import { GRAMMAR_COMMUNITY_REPOSITORY } from '../../../domain/repositories/grammar-community.repository.interface';
import type { IGrammarCommunityRepository } from '../../../domain/repositories/grammar-community.repository.interface';

@QueryHandler(GetCrowdsourcedQuizzesQuery)
export class GetCrowdsourcedQuizzesHandler implements IQueryHandler<GetCrowdsourcedQuizzesQuery, any> {
  constructor(
    @Inject(GRAMMAR_COMMUNITY_REPOSITORY)
    private readonly communityRepository: IGrammarCommunityRepository
  ) {}

  async execute(query: GetCrowdsourcedQuizzesQuery): Promise<any> {
    const { lessonId } = query;
    return this.communityRepository.findCrowdsourcedQuizzes(lessonId, 'APPROVED');
  }
}
