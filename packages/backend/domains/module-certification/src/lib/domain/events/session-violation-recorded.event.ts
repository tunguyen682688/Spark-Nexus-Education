import { DomainEvent } from '@spark-nest-ed/shared-libs';
import * as crypto from 'crypto';

export class SessionViolationRecordedEvent extends DomainEvent {
  constructor(
    public readonly violationId: string,
    public readonly sessionId: string,
    public readonly violationType: string,
    public readonly description: string | null,
    public readonly occurredAt: Date,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return crypto.randomUUID();
  }

  getEventName(): string {
    return 'certification.violation-recorded';
  }
}
