import { Command } from '@nestjs/cqrs';

export class SubmitDailyQuizCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly dto: { xpEarned?: number; score?: number }
  ) {
    super();
  }
}
