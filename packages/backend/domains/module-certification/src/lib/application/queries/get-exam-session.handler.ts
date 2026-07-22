import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';
import { GetExamSessionQuery } from './get-exam-session.query';

@QueryHandler(GetExamSessionQuery)
export class GetExamSessionQueryHandler implements IQueryHandler<GetExamSessionQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetExamSessionQuery): Promise<Record<string, unknown>> {
    const session = await this.repository.findSessionById(query.sessionId);
    if (!session) {
      throw new NotFoundException(`Exam session with ID ${query.sessionId} not found`);
    }

    const [answers, snapshots] = await Promise.all([
      this.repository.findAnswersBySessionId(query.sessionId),
      this.repository.findSnapshotsBySessionId(query.sessionId),
    ]);

    return {
      ...session.toPlainObject(),
      answers: answers.map((a) => a.toPlainObject()),
      snapshots: snapshots.map((s) => s.toPlainObject()),
    };
  }
}

export { GetExamSessionQueryHandler as GetExamSessionHandler };
