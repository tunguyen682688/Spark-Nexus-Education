import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { CollectionEntity } from '../../../domain/entities/collection.entity';
import { CreateCollectionCommand } from './create-collection.command';

@CommandHandler(CreateCollectionCommand)
export class CreateCollectionCommandHandler implements ICommandHandler<CreateCollectionCommand> {
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: CreateCollectionCommand) {
    const { userId, title, description } = command;
    const id = crypto.randomUUID();

    const collection = CollectionEntity.create({
      id,
      title,
      description: description ?? null,
      ownerId: userId,
      publishStatus: 'draft',
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.repository.saveCollection(collection);

    return { id: saved.id, title: saved.getTitle(), description: saved.getDescription() };
  }
}
