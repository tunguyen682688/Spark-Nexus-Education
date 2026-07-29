import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as certificationRepoInterface from '../../../domain/repositories/certification.repository.interface';
import { GetPurchasedCollectionsQuery } from './get-purchased-collections.query';

@QueryHandler(GetPurchasedCollectionsQuery)
export class GetPurchasedCollectionsQueryHandler
  implements IQueryHandler<GetPurchasedCollectionsQuery>
{
  constructor(
    @Inject(certificationRepoInterface.CERTIFICATION_REPOSITORY)
    private readonly repository: certificationRepoInterface.ICertificationRepository
  ) {}

  async execute(query: GetPurchasedCollectionsQuery): Promise<Record<string, unknown>[]> {
    const purchases = await this.repository.findPurchasesByUserId(query.userId);

    const results = await Promise.all(
      purchases.map(async (purchase) => {
        const collection = await this.repository.findCollectionById(purchase.collectionId);

        return {
          id: purchase.id,
          collectionId: purchase.collectionId,
          userId: purchase.userId,
          purchasedAt: purchase.purchasedAt,
          amount: purchase.amount,
          currency: purchase.currency,
          paymentStatus: purchase.paymentStatus,
          collection: collection
            ? {
                id: collection.id,
                title: collection.getTitle(),
                description: collection.getDescription(),
                ownerId: collection.getOwnerId(),
                publishStatus: collection.getPublishStatus(),
              }
            : null,
        };
      })
    );

    return results;
  }
}
