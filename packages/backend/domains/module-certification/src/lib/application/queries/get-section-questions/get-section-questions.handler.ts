import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetSectionQuestionsQuery, SectionQuestionsResult } from './get-section-questions.query';

@QueryHandler(GetSectionQuestionsQuery)
export class GetSectionQuestionsQueryHandler implements IQueryHandler<GetSectionQuestionsQuery, SectionQuestionsResult> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetSectionQuestionsQuery): Promise<SectionQuestionsResult> {
    const exam = await this.repository.findExamById(query.examId);
    if (!exam) {
      throw new NotFoundException(`Exam "${query.examId}" not found`);
    }

    return this.repository.findSectionQuestionsPaginated({
      examId: query.examId,
      sectionId: query.sectionId,
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
    });
  }
}
