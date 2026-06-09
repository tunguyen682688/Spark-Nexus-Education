import { Command } from '@nestjs/cqrs';

export class SubmitSrsFeedbackCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly quizId: string,
    public readonly isCorrect: boolean
  ) {
    super();
  }
}
