import { ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateListeningMaterialCommand } from './create-material.command';
import { ListeningService } from '../../../domain/services/listening.service';
import { ListeningMaterialCreatedEvent } from '../../../domain/events/listening-material-created.event';
import { Logger } from '@nestjs/common';

@CommandHandler(CreateListeningMaterialCommand)
export class CreateListeningMaterialCommandHandler implements ICommandHandler<CreateListeningMaterialCommand> {
  private readonly logger = new Logger(CreateListeningMaterialCommandHandler.name);

  constructor(
    private readonly listeningService: ListeningService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateListeningMaterialCommand) {
    const { dto, creatorId } = command;
    const material = await this.listeningService.createMaterial(dto, creatorId);

    // Publish domain event asynchronously
    setImmediate(async () => {
      try {
        await this.eventBus.publish(
          new ListeningMaterialCreatedEvent(
            material.id,
            creatorId,
            material.title,
            material.category,
            material.difficulty
          )
        );
      } catch (error) {
        this.logger.error('Failed to publish ListeningMaterialCreatedEvent', error);
      }
    });

    return material;
  }
}
