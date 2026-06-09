import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(eventId?: string) {
    this.eventId = eventId || this.generateEventId();
    this.occurredOn = new Date();
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  abstract getEventName(): string;
}

export function sharedLibs(): string {
  return 'shared-libs';
}
