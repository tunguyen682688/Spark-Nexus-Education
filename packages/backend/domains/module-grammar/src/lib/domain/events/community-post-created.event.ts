import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

export class CommunityPostCreatedEvent extends DomainEvent {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'grammar.community-post-created';
  }
}
