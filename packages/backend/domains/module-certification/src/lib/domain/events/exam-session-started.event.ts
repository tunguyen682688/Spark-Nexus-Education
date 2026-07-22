import { DomainEvent } from '@spark-nest-ed/shared-libs';
import * as crypto from 'crypto';

export class ExamSessionStartedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: string,
    public readonly examId: string,
    public readonly userId: string,
    public readonly startedAt: Date,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return crypto.randomUUID();
  }

  getEventName(): string {
    return 'certification.session-started';
  }
}
