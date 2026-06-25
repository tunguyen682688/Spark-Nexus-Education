import { ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';
import { UpdateListeningProgressCommand } from './update-progress.command';
import { ListeningService } from '../../../domain/services/listening.service';
import { ListeningProgressUpdatedEvent } from '../../../domain/events/listening-progress-updated.event';
import { Logger } from '@nestjs/common';

@CommandHandler(UpdateListeningProgressCommand)
export class UpdateListeningProgressCommandHandler implements ICommandHandler<UpdateListeningProgressCommand> {
  private readonly logger = new Logger(UpdateListeningProgressCommandHandler.name);

  constructor(
    private readonly listeningService: ListeningService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdateListeningProgressCommand) {
    const { materialId, userId, dto } = command;
    const record = await this.listeningService.updateProgress(userId, materialId, dto);

    // Publish domain event asynchronously
    setImmediate(async () => {
      try {
        await this.eventBus.publish(
          new ListeningProgressUpdatedEvent(
            userId,
            materialId,
            dto.progress,
            dto.timeSpent,
            record.completedAt
          )
        );
      } catch (error) {
        this.logger.error('Failed to publish ListeningProgressUpdatedEvent', error);
      }
    });

    return record;
  }
}
