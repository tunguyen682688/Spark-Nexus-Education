import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserCertificatesQuery } from './get-user-certificates.query';
import { Inject } from '@nestjs/common';
import { GRAMMAR_EXAM_REPOSITORY } from '../../../domain/repositories/grammar-exam.repository.interface';
import type { IGrammarExamRepository } from '../../../domain/repositories/grammar-exam.repository.interface';

@QueryHandler(GetUserCertificatesQuery)
export class GetUserCertificatesHandler implements IQueryHandler<GetUserCertificatesQuery, any> {
  constructor(
    @Inject(GRAMMAR_EXAM_REPOSITORY)
    private readonly examRepository: IGrammarExamRepository
  ) {}

  async execute(query: GetUserCertificatesQuery): Promise<any> {
    const { userId } = query;
    return this.examRepository.findCertificates(userId);
  }
}
