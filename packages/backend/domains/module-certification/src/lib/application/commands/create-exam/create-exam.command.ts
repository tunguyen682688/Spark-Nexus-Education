import { Command } from '@nestjs/cqrs';

export class CreateExamCommand extends Command<{ id: string; title: string; collectionId: string }> {
  constructor(
    public readonly userId: string,
    public readonly collectionId: string,
    public readonly title: string,
    public readonly description?: string | null,
    public readonly duration?: number,
    public readonly totalQuestions?: number,
    public readonly maxScore?: number,
    public readonly passScore?: number,
    public readonly examType?: string,
    public readonly certificationType?: string,
    public readonly level?: string | null,
    public readonly chapterId?: string | null,
    public readonly sections?: Array<{
      title: string;
      subtitle?: string | null;
      sectionType: string;
      instruction?: string;
      durationMinutes?: number;
      questionCount?: number;
      isBreak?: boolean;
    }>
  ) {
    super();
  }
}
