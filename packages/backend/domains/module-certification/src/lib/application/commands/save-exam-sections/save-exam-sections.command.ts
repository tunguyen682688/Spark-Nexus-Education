import { Command } from '@nestjs/cqrs';
import { ExamSectionEntity } from '../../../domain/entities/exam-section.entity';

export class SaveExamSectionsCommand extends Command<ExamSectionEntity[]> {
  constructor(
    public readonly examId: string,
    public readonly userId: string,
    public readonly sections: Array<{
      id?: string;
      title: string;
      subtitle?: string | null;
      sectionType?: string;
      instruction?: string | null;
      order: number;
      durationMinutes?: number;
      questionCount?: number;
      isBreak?: boolean;
    }>
  ) {
    super();
  }
}
