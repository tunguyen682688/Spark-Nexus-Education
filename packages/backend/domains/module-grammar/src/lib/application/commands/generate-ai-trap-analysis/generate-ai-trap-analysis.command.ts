import { Command } from '@nestjs/cqrs';

export class GenerateAiTrapAnalysisCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly trapId: string
  ) {
    super();
  }
}
