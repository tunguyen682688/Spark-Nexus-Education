import { ICommand } from '@nestjs/cqrs';

export class AddCollectionDiscussionCommand implements ICommand {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly content: string
  ) {}

  static fromDto(dto: {
    collectionId: string;
    userId: string;
    title: string;
    content: string;
  }) {
    return new AddCollectionDiscussionCommand(
      dto.collectionId,
      dto.userId,
      dto.title,
      dto.content
    );
  }
}
