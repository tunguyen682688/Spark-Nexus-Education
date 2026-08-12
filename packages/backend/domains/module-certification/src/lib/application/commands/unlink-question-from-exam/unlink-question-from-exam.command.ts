import { Command } from '@nestjs/cqrs';

export class UnlinkQuestionFromExamCommand extends Command<void> {
  constructor(
    public readonly examId: string,
    public readonly questionId: string,
    public readonly userId: string
  ) {
    super();
  }
}
