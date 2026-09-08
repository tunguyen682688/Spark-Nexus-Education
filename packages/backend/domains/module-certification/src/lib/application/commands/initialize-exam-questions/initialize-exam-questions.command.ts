import { Command } from '@nestjs/cqrs';

export interface InitializeExamQuestionsResult {
  examId: string;
  sectionsCreated: number;
  questionsCreated: number;
}

export class InitializeExamQuestionsCommand extends Command<InitializeExamQuestionsResult> {
  constructor(
    public readonly examId: string,
    public readonly userId: string,
    public readonly certificationType: string
  ) {
    super();
  }
}
