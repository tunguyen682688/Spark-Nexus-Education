import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetExamSetsQuery } from './get-exam-sets.query';
import { Inject } from '@nestjs/common';
import { GRAMMAR_EXAM_REPOSITORY } from '../../../domain/repositories/grammar-exam.repository.interface';
import type { IGrammarExamRepository } from '../../../domain/repositories/grammar-exam.repository.interface';

@QueryHandler(GetExamSetsQuery)
export class GetExamSetsHandler implements IQueryHandler<GetExamSetsQuery, any> {
  constructor(
    @Inject(GRAMMAR_EXAM_REPOSITORY)
    private readonly examRepository: IGrammarExamRepository
  ) {}

  async execute(query: GetExamSetsQuery): Promise<any> {
    const { userId, filters } = query;

    const examSets = await this.examRepository.findExamSets({
      level: filters.level,
      examType: filters.examType,
      search: filters.search,
      status: 'APPROVED',
    });

    const progressList = await this.examRepository.findUserExamProgress(
      userId,
      examSets.map((e) => e.id)
    );

    const progressMap = new Map<string, any>(
      progressList.map((p) => [p.examSetId, p])
    );

    return examSets.map((set) => {
      const prog = progressMap.get(set.id);
      return {
        ...set,
        bestScore: prog ? prog.bestScore : 0,
        isPassed: prog ? prog.isPassed : false,
      };
    });
  }
}
