import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetGrammarTrapsQuery } from './get-grammar-traps.query';
import { Inject } from '@nestjs/common';
import { GRAMMAR_TRAP_REPOSITORY } from '../../../domain/repositories/grammar-trap.repository.interface';
import type { IGrammarTrapRepository } from '../../../domain/repositories/grammar-trap.repository.interface';

@QueryHandler(GetGrammarTrapsQuery)
export class GetGrammarTrapsHandler implements IQueryHandler<GetGrammarTrapsQuery, any> {
  constructor(
    @Inject(GRAMMAR_TRAP_REPOSITORY)
    private readonly trapRepository: IGrammarTrapRepository
  ) {}

  async execute(query: GetGrammarTrapsQuery): Promise<any> {
    const { userId, status } = query;
    return this.trapRepository.findByUser(userId, status);
  }
}
