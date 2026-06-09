import { Command } from '@nestjs/cqrs';

export class UpvoteCrowdsourcedQuizCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly quizId: string
  ) {
    super();
  }
}
