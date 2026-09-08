import { Command } from '@nestjs/cqrs';
import { PatchExamContentDto } from '../../dtos/save-exam-content.dto';

export interface PatchExamContentResult {
  examId: string;
  sectionsUpdated: number;
  questionsUpdated: number;
  tempIdMap: Record<string, string>;
}

export class PatchExamContentCommand extends Command<PatchExamContentResult> {
  constructor(
    public readonly examId: string,
    public readonly userId: string,
    public readonly dto: PatchExamContentDto
  ) {
    super();
  }
}
