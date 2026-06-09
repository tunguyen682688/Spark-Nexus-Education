import { Command } from '@nestjs/cqrs';

export class SubmitExamAttemptCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly id: string,
    public readonly correctCount: number,
    public readonly totalCount: number
  ) {
    super();
  }
}
