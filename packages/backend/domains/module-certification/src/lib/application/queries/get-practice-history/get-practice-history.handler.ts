import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetPracticeHistoryQuery } from './get-practice-history.query';

@QueryHandler(GetPracticeHistoryQuery)
export class GetPracticeHistoryQueryHandler
  implements IQueryHandler<GetPracticeHistoryQuery>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetPracticeHistoryQuery): Promise<Record<string, unknown>[]> {
    const sessions = await this.repository.findSessionsByUserId(query.userId);

    const history = await Promise.all(
      sessions.map(async (session) => {
        const exam = await this.repository.findExamById(session.getExamId());
        const result = await this.repository.findResultBySessionId(session.id);

        return {
          sessionId: session.id,
          examId: session.getExamId(),
          status: session.getStatus(),
          startedAt: session.getStartedAt(),
          endedAt: session.getEndedAt(),
          exam: exam
            ? {
                id: exam.id,
                title: exam.getTitle(),
                collectionId: exam.getCollectionId(),
                duration: exam.getDuration(),
                totalQuestions: exam.getTotalQuestions(),
              }
            : null,
          result: result
            ? {
                id: result.id,
                totalScore: result.getTotalScore(),
                passed: result.isPassed(),
                createdAt: result.createdAt,
              }
            : null,
        };
      })
    );

    return history;
  }
}
