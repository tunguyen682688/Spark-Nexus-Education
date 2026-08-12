import { Command } from '@nestjs/cqrs';

export class DeleteExamCommand extends Command<{ deleted: boolean; collectionId: string }> {
  constructor(
    public readonly examId: string,
    public readonly userId: string
  ) {
    super();
  }
}
