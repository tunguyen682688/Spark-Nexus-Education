import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { DeleteStudioArticleCommand } from './delete-studio-article.command';
import * as readingRepositoryInterface from '../../../domain/repositories/reading.repository.interface';

@CommandHandler(DeleteStudioArticleCommand)
export class DeleteStudioArticleHandler
  implements ICommandHandler<DeleteStudioArticleCommand>
{
  constructor(
    @Inject(readingRepositoryInterface.READING_REPOSITORY)
    private readonly readingRepository: readingRepositoryInterface.IReadingRepository
  ) {}

  async execute(command: DeleteStudioArticleCommand): Promise<void> {
    const article = await this.readingRepository.findArticleById(command.articleId);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.getCreatorId() !== command.userId) {
      throw new UnauthorizedException('You can only delete your own articles');
    }

    await this.readingRepository.deleteArticle(command.articleId);
  }
}
