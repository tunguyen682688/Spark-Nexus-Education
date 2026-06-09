/**
 * Base class for all domain events
 * Following DDD pattern for event-driven architecture
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor(eventId?: string) {
    this.eventId = eventId || this.generateEventId();
    this.occurredOn = new Date();
  }

  protected abstract generateEventId(): string;

  /**
   * Get event name for logging and routing
   */
  abstract getEventName(): string;
}
