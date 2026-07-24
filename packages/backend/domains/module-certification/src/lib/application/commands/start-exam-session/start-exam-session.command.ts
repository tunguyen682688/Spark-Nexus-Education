import { Command } from '@nestjs/cqrs';
import { ExamSessionEntity } from '../../../domain/entities/exam-session.entity';

export class StartExamSessionCommand extends Command<ExamSessionEntity> {
  constructor(
    public readonly examId: string,
    public readonly userId: string
  ) {
    super();
  }
}
