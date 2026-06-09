import { Command } from '@nestjs/cqrs';

export class SubmitGraduationExamCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly level: string,
    public readonly percentage: number
  ) {
    super();
  }
}
