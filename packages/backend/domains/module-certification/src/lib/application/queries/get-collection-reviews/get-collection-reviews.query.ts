import { IQuery } from '@nestjs/cqrs';

export class GetCollectionReviewsQuery implements IQuery {
  constructor(
    public readonly collectionId: string,
    public readonly userId?: string
  ) {}

  static fromDto(dto: { collectionId: string; userId?: string }) {
    return new GetCollectionReviewsQuery(dto.collectionId, dto.userId);
  }
}
