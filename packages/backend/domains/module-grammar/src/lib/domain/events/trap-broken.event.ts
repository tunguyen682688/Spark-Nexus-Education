import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

export class TrapBrokenEvent extends DomainEvent {
  constructor(
    public readonly trapId: string,
    public readonly userId: string,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'grammar.trap-broken';
  }
}
