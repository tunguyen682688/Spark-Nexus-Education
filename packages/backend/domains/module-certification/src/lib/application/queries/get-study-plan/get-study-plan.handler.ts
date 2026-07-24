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
    const [sessions, examsResult] = await Promise.all([
      this.repository.findSessionsByUserId(query.userId),
      this.repository.findExams({ limit: 7 }),
    ]);

    const completedExamIds = new Set(
      sessions.filter((s) => s.getStatus() === 'completed').map((s) => s.getExamId())
    );

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const realExams = examsResult.items;

    return days.map((day, idx) => {
      const exam = realExams[idx % Math.max(1, realExams.length)];
      const isCompleted = exam
        ? completedExamIds.has(exam.id) || sessions.length > idx
        : false;

      return {
        day,
        title: exam ? exam.getTitle() : `Mock Practice Task #${idx + 1}`,
        topic: exam ? (exam.getDescription() || 'Target Section & Skill Practice') : 'Vocabulary & Skill Building',
        duration: exam && exam.getDuration() > 0 ? `${exam.getDuration()}m` : '45m',
        completed: isCompleted,
      };
    });
  }
}
