import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as certificationRepoInterface from '../../domain/repositories/certification.repository.interface';
import { GetCollectionQuery } from './get-collection.query';

@QueryHandler(GetCollectionQuery)
export class GetCollectionQueryHandler implements IQueryHandler<GetCollectionQuery> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCollectionQuery): Promise<Record<string, unknown>> {
    const collection = await this.repository.findCollectionById(query.id);
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${query.id} not found`);
    }

    // Fetch real exams belonging to this collection
    const exams = await this.repository.findExamsByCollectionId(query.id);

    return {
      ...collection.toPlainObject(),
      exams: exams.map((exam) => exam.toPlainObject()),
    };
  }
}

export { GetCollectionQueryHandler as GetCollectionHandler };
