import { Command } from '@nestjs/cqrs';

export class UpdateExamCommand extends Command<{ id: string }> {
  constructor(
    public readonly examId: string,
    public readonly userId: string,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly duration?: number,
    public readonly totalQuestions?: number,
    public readonly maxScore?: number,
    public readonly passScore?: number
  ) {
    super();
  }
}
