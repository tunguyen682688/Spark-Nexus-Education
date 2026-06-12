import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UpdateReadingProgressCommand } from './update-reading-progress.command';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { READING_REPOSITORY } from '../../../domain/repositories/reading.repository.interface';
import type { IReadingRepository } from '../../../domain/repositories/reading.repository.interface';
import { ReadingProgressEntity } from '../../../domain/entities/reading-progress.entity';
import { v4 as uuidv4 } from 'uuid';

@CommandHandler(UpdateReadingProgressCommand)
export class UpdateReadingProgressCommandHandler
  implements ICommandHandler<UpdateReadingProgressCommand>
{
  private readonly logger = new Logger(UpdateReadingProgressCommandHandler.name);

  constructor(
    @Inject(READING_REPOSITORY)
    private readonly repository: IReadingRepository,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: UpdateReadingProgressCommand) {
    const { userId, articleId, progress, lastPosition, timeSpent } = command;

    // Verify article exists first
    const article = await this.repository.findArticleById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    let progressEntity = await this.repository.findReadingProgress(userId, articleId);

    if (!progressEntity) {
      // Create new progress entity
      progressEntity = ReadingProgressEntity.create({
        id: uuidv4(),
        userId,
        articleId,
        progress,
        lastPosition,
        timeSpent,
      });
    } else {
      // Update existing progress entity
      progressEntity.updateProgress(progress, lastPosition, timeSpent);
    }

    const saved = await this.repository.saveReadingProgress(progressEntity);

    // Publish domain events asynchronously
    const events = progressEntity.getDomainEvents();
    if (events.length > 0) {
      setImmediate(async () => {
        try {
          for (const event of events) {
            await this.eventBus.publish(event);
          }
        } catch (error) {
          this.logger.error('Failed to publish reading progress events', error);
        }
      });
      progressEntity.clearDomainEvents();
    }

    return saved.toPersistence();
  }
}
