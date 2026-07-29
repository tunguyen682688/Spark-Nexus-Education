import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { AddCollectionDiscussionCommand } from './add-collection-discussion.command';

@CommandHandler(AddCollectionDiscussionCommand)
export class AddCollectionDiscussionCommandHandler
  implements ICommandHandler<AddCollectionDiscussionCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: AddCollectionDiscussionCommand) {
    const discussion = await this.repository.saveDiscussion({
      collectionId: command.collectionId,
      userId: command.userId,
      title: command.title,
      content: command.content,
    });

    return {
      id: discussion.id,
      collectionId: discussion.collectionId,
      userId: discussion.userId,
      title: discussion.title,
      content: discussion.content,
      repliesCount: 0,
      createdAt: discussion.createdAt.toISOString(),
      updatedAt: discussion.updatedAt.toISOString(),
    };
  }
}
