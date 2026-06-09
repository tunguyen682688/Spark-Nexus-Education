import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: EntryCreated
 * Raised when a new entry is created (draft status, needs approval)
 */
export class EntryCreatedEvent extends DomainEvent {
  constructor(
    public readonly entryId: string,
    public readonly word: string,
    public readonly language: string,
    public readonly userId: string,
    public readonly needsApproval: boolean,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'entry.created';
  }
}
