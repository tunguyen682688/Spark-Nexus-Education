import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetStudyPlanQuery } from './get-study-plan.query';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';

@QueryHandler(GetStudyPlanQuery)
export class GetStudyPlanQueryHandler implements IQueryHandler<GetStudyPlanQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetStudyPlanQuery) {
    const sessions = await this.repository.findSessionsByUserId(query.userId);
    const completedCount = sessions.filter((s) => s.getStatus() === 'completed').length;

    return [
      {
        day: 'Mon',
        title: 'IELTS Listening Practice',
        topic: 'Part 3 Multiple Choice Questions',
        duration: '45m',
        completed: completedCount >= 1,
      },
      {
        day: 'Tue',
        title: 'Academic Reading Skills',
        topic: 'Skimming and Scanning Techniques',
        duration: '50m',
        completed: completedCount >= 2,
      },
      {
        day: 'Wed',
        title: 'Writing Task 2 Practice',
        topic: 'Discuss Both Views Essays Structure',
        duration: '60m',
        completed: completedCount >= 3,
      },
      {
        day: 'Thu',
        title: 'Vocabulary Expansion',
        topic: 'C1/C2 Academic Words Masterclass',
        duration: '30m',
        completed: completedCount >= 4,
      },
      {
        day: 'Fri',
        title: 'Speaking Mock Test',
        topic: 'Part 2 & Part 3 Topic Reviews',
        duration: '40m',
        completed: completedCount >= 5,
      },
      {
        day: 'Sat',
        title: 'Full Exam Simulation',
        topic: 'IELTS Listening & Reading Full Test',
        duration: '150m',
        completed: completedCount >= 6,
      },
      {
        day: 'Sun',
        title: 'Error Analysis & Review',
        topic: 'Detailed Review of Wrong Answers',
        duration: '60m',
        completed: completedCount >= 7,
      },
    ];
  }
}
