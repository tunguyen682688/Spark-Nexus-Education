import { Command } from '@nestjs/cqrs';

export interface ExamFormatFields {
  audioUrl?: string | null;
  imageUrl?: string | null;
  partNumber?: number | null;
  gapNumber?: number | null;
  writingTaskType?: string | null;
  speakingPrompt?: string | null;
  isGridIn?: boolean;
  formatMetadata?: unknown | null;
}

export class LinkQuestionToExamCommand extends Command<{ examQuestionId: string }> {
  constructor(
    public readonly examId: string,
    public readonly questionId: string,
    public readonly userId: string,
    public readonly order?: number,
    public readonly points?: number,
    public readonly sectionId?: string,
    public readonly formatFields?: ExamFormatFields
  ) {
    super();
  }
}
