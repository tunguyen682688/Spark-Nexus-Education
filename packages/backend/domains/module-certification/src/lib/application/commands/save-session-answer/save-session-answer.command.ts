import { Command } from '@nestjs/cqrs';
import { SessionAnswerEntity } from '../../../domain/entities/session-answer.entity';

export class SaveSessionAnswerCommand extends Command<SessionAnswerEntity> {
  constructor(
    public readonly sessionId: string,
    public readonly questionId: string,
    public readonly answerText?: string | null,
    public readonly choiceIds?: string[]
  ) {
    super();
  }
}
