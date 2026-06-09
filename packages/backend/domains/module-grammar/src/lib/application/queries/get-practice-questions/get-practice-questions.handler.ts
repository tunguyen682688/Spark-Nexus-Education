import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPracticeQuestionsQuery } from './get-practice-questions.query';
import { Inject } from '@nestjs/common';
import { GRAMMAR_COMMUNITY_REPOSITORY } from '../../../domain/repositories/grammar-community.repository.interface';
import type { IGrammarCommunityRepository } from '../../../domain/repositories/grammar-community.repository.interface';
import { PRACTICE_QUESTIONS_POOL } from '../../../common/constants/grammar-questions.constants';

@QueryHandler(GetPracticeQuestionsQuery)
export class GetPracticeQuestionsHandler implements IQueryHandler<GetPracticeQuestionsQuery, any> {
  constructor(
    @Inject(GRAMMAR_COMMUNITY_REPOSITORY)
    private readonly communityRepository: IGrammarCommunityRepository
  ) {}

  async execute(query: GetPracticeQuestionsQuery): Promise<any> {
    const { filters } = query;

    const questionPool = PRACTICE_QUESTIONS_POOL;

    let filtered = questionPool.filter(q => {
      if (filters.level && q.level !== filters.level) return false;
      if (filters.category && q.category.toLowerCase() !== filters.category.toLowerCase()) return false;
      if (filters.type && q.type !== filters.type) return false;
      return true;
    });

    try {
      const dbQuizzes = await this.communityRepository.findCrowdsourcedQuizzes('ALL', 'APPROVED'); // ALL lesson or filter by lesson
      const mappedDbQuizzes = dbQuizzes.map((q: any) => {
        const qData = q.questionData || {};
        return {
          id: q.id,
          text: qData.text || '',
          type: q.questionType,
          category: qData.category || 'syntax',
          level: qData.level || 'B2',
          options: qData.options || [],
          correctAnswer: qData.answer || qData.correctAnswer || '',
          optionExplanations: qData.optionExplanations || {},
          words: qData.words || [],
          slots: qData.slots || [],
          explanation: q.explanation || '',
        };
      });

      const filteredDb = mappedDbQuizzes.filter(q => {
        if (filters.level && q.level !== filters.level) return false;
        if (filters.category && q.category.toLowerCase() !== filters.category.toLowerCase()) return false;
        if (filters.type && q.type !== filters.type) return false;
        return true;
      });

      filtered = [...filtered, ...filteredDb];
    } catch (e) {
      console.error('Error fetching db crowdsourced quizzes in practice questions handler:', e);
    }

    return filtered;
  }
}
