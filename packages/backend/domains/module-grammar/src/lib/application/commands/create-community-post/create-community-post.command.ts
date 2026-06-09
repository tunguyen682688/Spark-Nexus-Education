import { Command } from '@nestjs/cqrs';

export class CreateCommunityPostCommand extends Command<any> {
  constructor(
    public readonly userId: string,
    public readonly dto: {
      title: string;
      content: string;
      tags: string[];
      hasQuiz?: boolean;
      quizType?: string;
      quizData?: unknown;
    }
  ) {
    super();
  }
}
