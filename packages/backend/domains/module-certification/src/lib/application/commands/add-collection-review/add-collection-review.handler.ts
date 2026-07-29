import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { AddCollectionReviewCommand } from './add-collection-review.command';

@CommandHandler(AddCollectionReviewCommand)
export class AddCollectionReviewCommandHandler
  implements ICommandHandler<AddCollectionReviewCommand>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(command: AddCollectionReviewCommand) {
    const review = await this.repository.saveReviewWithUser({
      collectionId: command.collectionId,
      userId: command.userId,
      rating: command.rating,
      text: command.text,
    });

    return {
      id: review.id,
      author: review.user?.name || review.user?.email || 'Learner',
      avatar: review.user?.picture || null,
      rating: review.rating,
      text: review.text,
      date: 'Just now',
    };
  }
}
