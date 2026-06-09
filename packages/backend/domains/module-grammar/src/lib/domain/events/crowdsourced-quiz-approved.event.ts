import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

export class CrowdsourcedQuizApprovedEvent extends DomainEvent {
  constructor(
    public readonly quizId: string,
    public readonly contributorId: string,
    public readonly xpReward: number,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'grammar.crowdsourced-quiz-approved';
  }
}
