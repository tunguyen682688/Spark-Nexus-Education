import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetExamResultQuery } from './get-exam-result.query';

@QueryHandler(GetExamResultQuery)
export class GetExamResultQueryHandler implements IQueryHandler<GetExamResultQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetExamResultQuery): Promise<Record<string, unknown>> {
    const result = await this.repository.findResultById(query.resultId);
    if (!result) {
      throw new NotFoundException(`Exam result with ID ${query.resultId} not found`);
    }

    const [skillResults, questionResults, aiEvaluation] = await Promise.all([
      this.repository.findSkillResultsByResultId(query.resultId),
      this.repository.findQuestionResultsByResultId(query.resultId),
      this.repository.findAiEvaluationByResultId(query.resultId),
    ]);

    return {
      ...result.toPlainObject(),
      skillResults: skillResults.map((s) => s.toPlainObject()),
      questionResults: questionResults.map((q) => q.toPlainObject()),
      aiEvaluation: aiEvaluation ? aiEvaluation.toPlainObject() : null,
    };
  }
}

export { GetExamResultQueryHandler as GetExamResultHandler };
