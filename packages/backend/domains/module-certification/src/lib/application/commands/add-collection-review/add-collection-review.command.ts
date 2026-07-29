import { ICommand } from '@nestjs/cqrs';

export class AddCollectionReviewCommand implements ICommand {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string,
    public readonly rating: number,
    public readonly text: string
  ) {}

  static fromDto(dto: {
    collectionId: string;
    userId: string;
    rating: number;
    text: string;
  }) {
    return new AddCollectionReviewCommand(
      dto.collectionId,
      dto.userId,
      dto.rating,
      dto.text
    );
  }
}
