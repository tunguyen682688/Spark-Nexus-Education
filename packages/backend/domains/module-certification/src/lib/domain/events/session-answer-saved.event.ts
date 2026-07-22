import { DomainEvent } from '@spark-nest-ed/shared-libs';
import * as crypto from 'crypto';

export class SessionAnswerSavedEvent extends DomainEvent {
  constructor(
    public readonly answerId: string,
    public readonly sessionId: string,
    public readonly questionId: string,
    public readonly answerText: string | null,
    public readonly choiceIds: string[],
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return crypto.randomUUID();
  }

  getEventName(): string {
    return 'certification.answer-saved';
  }
}
