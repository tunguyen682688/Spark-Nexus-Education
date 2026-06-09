import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: EntryAddedToSetEvent
 * Raised when an entry is added to a vocabulary set
 */
export class EntryAddedToSetEvent extends DomainEvent {
  constructor(
    public readonly vocabularySetId: string,
    public readonly entryId: string,
    public readonly itemId: string,
    public readonly userId: string,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'entry.added-to-set';
  }
}
