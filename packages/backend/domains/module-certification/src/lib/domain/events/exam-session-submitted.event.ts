import { DomainEvent } from '@spark-nest-ed/shared-libs';
import * as crypto from 'crypto';

export class ExamSessionSubmittedEvent extends DomainEvent {
  constructor(
    public readonly sessionId: string,
    public readonly examId: string,
    public readonly userId: string,
    public readonly score: number,
    public readonly passed: boolean,
    public readonly submittedAt: Date,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return crypto.randomUUID();
  }

  getEventName(): string {
    return 'certification.session-submitted';
  }
}
