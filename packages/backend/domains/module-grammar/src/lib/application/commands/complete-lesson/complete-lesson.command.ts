import { Command } from '@nestjs/cqrs';

export class CompleteLessonCommand extends Command<{ id: string; success: boolean; data: unknown }> {
  constructor(
    public readonly lessonId: string,
    public readonly userId: string,
    public readonly score = 100
  ) {
    super();
  }
}
