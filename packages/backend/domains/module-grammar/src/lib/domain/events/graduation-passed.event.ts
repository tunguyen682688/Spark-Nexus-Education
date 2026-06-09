import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

export class GraduationPassedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly level: string,
    public readonly xpEarned: number,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'grammar.graduation-passed';
  }
}
