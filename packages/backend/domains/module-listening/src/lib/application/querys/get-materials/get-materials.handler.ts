import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetListeningMaterialsQuery } from './get-materials.query';
import { Inject } from '@nestjs/common';
import { LISTENING_REPOSITORY } from '../../../domain/repositories/listening.repository.interface';
import type { IListeningRepository } from '../../../domain/repositories/listening.repository.interface';

@QueryHandler(GetListeningMaterialsQuery)
export class GetListeningMaterialsQueryHandler implements IQueryHandler<GetListeningMaterialsQuery> {
  constructor(
    @Inject(LISTENING_REPOSITORY)
    private readonly listeningRepository: IListeningRepository
  ) {}

  async execute(query: GetListeningMaterialsQuery) {
    const { dto, userId } = query;
    return this.listeningRepository.findMaterials(dto, userId);
  }
}
