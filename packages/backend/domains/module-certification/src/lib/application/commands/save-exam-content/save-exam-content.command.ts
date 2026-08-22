import { Command } from '@nestjs/cqrs';
import { SaveExamContentDto } from '../../dtos/save-exam-content.dto';

export interface SaveExamContentResult {
  examId: string;
  sectionsCreated: number;
  questionsCreated: number;
}

export class SaveExamContentCommand extends Command<SaveExamContentResult> {
  constructor(
    public readonly examId: string,
    public readonly userId: string,
    public readonly dto: SaveExamContentDto
  ) {
    super();
  }
}
