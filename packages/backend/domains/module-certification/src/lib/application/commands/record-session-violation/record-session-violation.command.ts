import { Command } from '@nestjs/cqrs';
import { SessionViolationEntity } from '../../../domain/entities/session-violation.entity';

export class RecordSessionViolationCommand extends Command<SessionViolationEntity> {
  constructor(
    public readonly sessionId: string,
    public readonly violationType: string,
    public readonly description: string | null
  ) {
    super();
  }
}
