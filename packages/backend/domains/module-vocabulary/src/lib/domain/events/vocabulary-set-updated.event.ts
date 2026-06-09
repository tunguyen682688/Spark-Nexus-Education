import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: VocabularySetUpdated
 * Raised when a vocabulary set is updated
 */
export class VocabularySetUpdatedEvent extends DomainEvent {
  constructor(
    public readonly vocabularySetId: string,
    public readonly userId: string,
    public readonly changes: {
      title?: string;
      description?: string;
      difficulty?: string;
      tags?: string[];
      coverImage?: string;
    },
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'vocabulary-set.updated';
  }
}
