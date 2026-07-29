import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetCollectionReviewsQuery } from './get-collection-reviews.query';

@QueryHandler(GetCollectionReviewsQuery)
export class GetCollectionReviewsQueryHandler
  implements IQueryHandler<GetCollectionReviewsQuery>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetCollectionReviewsQuery) {
    const reviews = await this.repository.findReviewsByCollectionIdWithUser(
      query.collectionId
    );

    const items = reviews.map((r) => ({
      id: r.id,
      author: r.user?.name || r.user?.email || 'Learner',
      avatar: r.user?.picture || null,
      rating: r.rating,
      text: r.text,
      date: this.formatDate(r.createdAt),
    }));

    const avgRating =
      items.length > 0
        ? items.reduce((sum, r) => sum + r.rating, 0) / items.length
        : 0;

    return {
      items,
      total: items.length,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }

  private formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
