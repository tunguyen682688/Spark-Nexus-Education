import { Command } from '@nestjs/cqrs';

export class DeleteExamCommand extends Command<{ deleted: boolean }> {
  constructor(
    public readonly examId: string,
    public readonly userId: string
  ) {
    super();
  }
}
