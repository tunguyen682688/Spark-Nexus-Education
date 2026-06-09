import { Command } from '@nestjs/cqrs';

export class SubmitCrowdsourcedQuizCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly lessonId: string,
    public readonly dto: { questionType: string; questionData: unknown; explanation: string }
  ) {
    super();
  }
}
