import { IQuery } from '@nestjs/cqrs';

export class GetCollectionDiscussionsQuery implements IQuery {
  constructor(
    public readonly collectionId: string,
    public readonly userId?: string
  ) {}

  static fromDto(dto: { collectionId: string; userId?: string }) {
    return new GetCollectionDiscussionsQuery(dto.collectionId, dto.userId);
  }
}
