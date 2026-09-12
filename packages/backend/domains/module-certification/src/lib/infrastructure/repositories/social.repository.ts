import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { UserDownload, CollectionPurchase, CollectionReport } from '@prisma/client';

@Injectable()
export class SocialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFavoritesByUserId(userId: string) {
    return this.prisma.collectionFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFavoritesWithCollectionsByUserId(userId: string) {
    const favorites = await this.prisma.collectionFavorite.findMany({
      where: { userId },
      include: {
        collection: {
          select: {
            id: true, title: true, description: true,
            ownerId: true, publishStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.enrichWithExams(favorites, (f) => f.collection);
  }

  async findFavoriteById(id: string) {
    return this.prisma.collectionFavorite.findUnique({ where: { id } });
  }

  async findFavoriteByUserAndCollection(userId: string, collectionId: string) {
    return this.prisma.collectionFavorite.findUnique({
      where: { collectionId_userId: { collectionId, userId } },
    });
  }

  async saveFavorite(favorite: { userId: string; collectionId: string }) {
    return this.prisma.collectionFavorite.upsert({
      where: { collectionId_userId: { collectionId: favorite.collectionId, userId: favorite.userId } },
      create: { collectionId: favorite.collectionId, userId: favorite.userId },
      update: {},
    });
  }

  async deleteFavorite(userId: string, collectionId: string): Promise<void> {
    await this.prisma.collectionFavorite.delete({
      where: { collectionId_userId: { collectionId, userId } },
    });
  }

  async findBookmarksByUserId(userId: string) {
    return this.prisma.collectionBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBookmarksWithDetailsByUserId(userId: string) {
    const bookmarks = await this.prisma.collectionBookmark.findMany({
      where: { userId },
      include: {
        collection: {
          select: {
            id: true, title: true, description: true,
            ownerId: true, publishStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.enrichWithExams(bookmarks, (b) => b.collection);
  }

  async findBookmarkById(id: string) {
    return this.prisma.collectionBookmark.findUnique({ where: { id } });
  }

  async findBookmarksWithCollectionsByUserId(userId: string) {
    const bookmarks = await this.prisma.collectionBookmark.findMany({
      where: { userId },
      include: {
        collection: {
          select: {
            id: true, title: true, description: true,
            ownerId: true, publishStatus: true, createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const collectionIds = bookmarks
      .filter((b): b is typeof b & { collection: NonNullable<typeof b.collection> } => b.collection !== null)
      .map(b => b.collection.id);

    const [examCounts, itemCounts] = await Promise.all([
      this.prisma.exam.groupBy({
        by: ['collectionId'],
        where: { collectionId: { in: collectionIds }, deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.collectionItem.groupBy({
        by: ['collectionId'],
        where: { collectionId: { in: collectionIds } },
        _count: { id: true },
      }),
    ]);

    const examCountMap = new Map(examCounts.map(e => [e.collectionId, e._count.id]));
    const itemCountMap = new Map(itemCounts.map(i => [i.collectionId, i._count.id]));

    return bookmarks.map(b => ({
      id: b.id,
      collectionId: b.collectionId,
      userId: b.userId,
      createdAt: b.createdAt,
      collection: b.collection ? {
        ...b.collection,
        examCount: examCountMap.get(b.collection.id) ?? 0,
        itemCount: itemCountMap.get(b.collection.id) ?? 0,
      } : null,
    }));
  }

  async findBookmarkByUserAndCollection(userId: string, collectionId: string) {
    return this.prisma.collectionBookmark.findUnique({
      where: { collectionId_userId: { collectionId, userId } },
    });
  }

  async saveBookmark(bookmark: { userId: string; collectionId: string }) {
    return this.prisma.collectionBookmark.upsert({
      where: { collectionId_userId: { collectionId: bookmark.collectionId, userId: bookmark.userId } },
      create: { collectionId: bookmark.collectionId, userId: bookmark.userId },
      update: {},
    });
  }

  async deleteBookmark(userId: string, collectionId: string): Promise<void> {
    await this.prisma.collectionBookmark.delete({
      where: { collectionId_userId: { collectionId, userId } },
    });
  }

  async findDownloadsByUserId(userId: string): Promise<UserDownload[]> {
    return this.prisma.userDownload.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveDownload(download: {
    userId: string; itemType: string; itemId: string;
    fileName: string; fileSize: number; downloadUrl?: string;
  }): Promise<UserDownload> {
    return this.prisma.userDownload.create({ data: download });
  }

  async deleteDownload(id: string): Promise<void> {
    await this.prisma.userDownload.delete({ where: { id } });
  }

  async deleteAllDownloads(userId: string): Promise<void> {
    await this.prisma.userDownload.deleteMany({ where: { userId } });
  }

  async findPurchasesByUserId(userId: string): Promise<CollectionPurchase[]> {
    return this.prisma.collectionPurchase.findMany({
      where: { userId },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  async findPurchaseByUserAndCollection(userId: string, collectionId: string): Promise<CollectionPurchase | null> {
    return this.prisma.collectionPurchase.findUnique({
      where: { userId_collectionId: { userId, collectionId } },
    });
  }

  async savePurchase(purchase: {
    userId: string; collectionId: string; amount?: number; currency?: string;
  }): Promise<CollectionPurchase> {
    return this.prisma.collectionPurchase.upsert({
      where: { userId_collectionId: { userId: purchase.userId, collectionId: purchase.collectionId } },
      create: {
        userId: purchase.userId, collectionId: purchase.collectionId,
        amount: purchase.amount, currency: purchase.currency,
      },
      update: { amount: purchase.amount, currency: purchase.currency },
    });
  }

  async saveReport(report: {
    collectionId: string; userId: string; reason?: string;
  }): Promise<CollectionReport> {
    return this.prisma.collectionReport.create({ data: report });
  }

  async findReviewsByCollectionId(collectionId: string) {
    return this.prisma.collectionReview.findMany({
      where: { collectionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findReviewsByCollectionIdWithUser(collectionId: string) {
    return this.prisma.collectionReview.findMany({
      where: { collectionId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true, picture: true } } },
    });
  }

  async findReviewById(id: string) {
    return this.prisma.collectionReview.findUnique({ where: { id } });
  }

  async findReviewByUserAndCollection(userId: string, collectionId: string) {
    return this.prisma.collectionReview.findFirst({ where: { userId, collectionId } });
  }

  async saveReview(data: { collectionId: string; userId: string; rating: number; text: string }) {
    const existing = await this.findReviewByUserAndCollection(data.userId, data.collectionId);
    if (existing) {
      return this.prisma.collectionReview.update({
        where: { id: existing.id },
        data: { rating: data.rating, text: data.text },
      });
    }
    return this.prisma.collectionReview.create({ data });
  }

  async saveReviewWithUser(data: { collectionId: string; userId: string; rating: number; text: string }) {
    const existing = await this.findReviewByUserAndCollection(data.userId, data.collectionId);
    if (existing) {
      return this.prisma.collectionReview.update({
        where: { id: existing.id },
        data: { rating: data.rating, text: data.text },
        include: { user: { select: { name: true, email: true, picture: true } } },
      });
    }
    return this.prisma.collectionReview.create({
      data,
      include: { user: { select: { name: true, email: true, picture: true } } },
    });
  }

  async deleteReview(id: string) {
    await this.prisma.collectionReview.delete({ where: { id } });
  }

  async findDiscussionsByCollectionId(collectionId: string) {
    return this.prisma.collectionDiscussion.findMany({
      where: { collectionId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { replies: true } } },
    });
  }

  async findDiscussionById(id: string) {
    return this.prisma.collectionDiscussion.findUnique({
      where: { id },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async saveDiscussion(data: { collectionId: string; userId: string; title: string; content: string }) {
    return this.prisma.collectionDiscussion.create({ data });
  }

  async deleteDiscussion(id: string) {
    await this.prisma.collectionDiscussion.delete({ where: { id } });
  }

  async findRepliesByDiscussionId(discussionId: string) {
    return this.prisma.discussionReply.findMany({
      where: { discussionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async saveReply(data: { discussionId: string; userId: string; content: string }) {
    return this.prisma.discussionReply.create({ data });
  }

  async deleteReply(id: string) {
    await this.prisma.discussionReply.delete({ where: { id } });
  }

  private async enrichWithExams<T extends { collection: { id: string } | null }>(
    records: T[],
    getCollection: (record: T) => { id: string } | null,
  ) {
    const collectionIds = records
      .filter((r) => getCollection(r) !== null)
      .map((r) => getCollection(r)!.id);

    const exams = collectionIds.length > 0
      ? await this.prisma.exam.findMany({
          where: { collectionId: { in: collectionIds }, deletedAt: null },
          select: { id: true, collectionId: true, title: true, duration: true, totalQuestions: true },
        })
      : [];

    const examsByCollection = new Map<string, typeof exams>();
    for (const exam of exams) {
      const list = examsByCollection.get(exam.collectionId) || [];
      list.push(exam);
      examsByCollection.set(exam.collectionId, list);
    }

    return records.map((r) => {
      const collection = getCollection(r);
      return {
        ...r,
        collection,
        exams: collection
          ? (examsByCollection.get(collection.id) || []).map((e) => ({
              id: e.id, title: e.title, duration: e.duration, totalQuestions: e.totalQuestions,
            }))
          : [],
      };
    });
  }
}
