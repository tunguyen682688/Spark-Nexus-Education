import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetQuestionHistoryQuery } from './get-question-history.query';

export interface QuestionVersionDto {
  id: string;
  questionId: string;
  version: number;
  content: string;
  createdAt: Date;
  createdBy: string | null;
}

@QueryHandler(GetQuestionHistoryQuery)
export class GetQuestionHistoryQueryHandler
  implements IQueryHandler<GetQuestionHistoryQuery, QuestionVersionDto[]>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetQuestionHistoryQuery): Promise<QuestionVersionDto[]> {
    return this.repository.findQuestionVersionsByQuestionId(query.questionId);
  }
}
