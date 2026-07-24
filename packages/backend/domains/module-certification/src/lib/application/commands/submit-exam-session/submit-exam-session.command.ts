import { Command } from '@nestjs/cqrs';
import { ExamResultEntity } from '../../../domain/entities/exam-result.entity';

export class SubmitExamSessionCommand extends Command<ExamResultEntity> {
  constructor(public readonly sessionId: string) {
    super();
  }
}
