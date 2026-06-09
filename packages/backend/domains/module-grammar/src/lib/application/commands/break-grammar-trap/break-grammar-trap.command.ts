import { Command } from '@nestjs/cqrs';

export class BreakGrammarTrapCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly trapId: string
  ) {
    super();
  }
}
