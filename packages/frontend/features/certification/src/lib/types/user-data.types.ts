import type { AnswerOptionItem } from './question.types';

export type { AnswerOptionItem };

export interface CertificateItem {
  id: string;
  collectionId: string;
  title: string;
  examCategory: string;
  issuedDate: string;
  score: string;
  downloadUrl?: string;
  credentialCode: string;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  itemCount: number;
}

export interface BookmarkItem {
  id: string;
  itemId: string;
  itemType: string;
  title: string;
  folderName: string;
  createdAt: string;
}

export interface BookmarksApiResponse {
  id: string;
  userId: string;
  totalBookmarks: number;
  folders: BookmarkFolder[];
  items: BookmarkItem[];
}

export interface PracticeHistoryResponse {
  id: string;
  userId: string;
  totalSessions: number;
  items: Array<{
    id: string;
    code: string;
    title: string;
    type: string;
    examPart: string;
    scoreDisplay: string;
    scoreSub: string;
    timeSpent: string;
    dateDisplay: string;
  }>;
}

export interface CompletedCollectionsResponse {
  id: string;
  userId: string;
  totalCompleted: number;
  items: Array<{
    id: string;
    title: string;
    category: string;
    examType: string;
    completedDate: string;
    scoreText: string;
    totalItems: number;
    certificateEligible: boolean;
  }>;
}

export interface FavoritesResponse {
  id: string;
  userId: string;
  totalFavorites: number;
  items: Array<{
    id: string;
    collectionId: string;
    title: string;
    exam: string;
    addedAt: string;
  }>;
}

export interface BookmarksResponse {
  id: string;
  userId: string;
  totalBookmarks: number;
  folders?: Array<{ id: string; name: string; itemCount: number }>;
  items: Array<{
    id: string;
    itemId: string;
    itemType: string;
    title: string;
    folderName: string;
    createdAt: string;
  }>;
}

export interface DownloadsResponse {
  id: string;
  userId: string;
  totalDownloads: number;
  items: Array<{
    id: string;
    collectionId: string;
    title: string;
    downloadedAt: string;
    fileSize: string;
  }>;
}

export interface PurchasedCollectionsResponse {
  id: string;
  userId: string;
  totalPurchased: number;
  items: Array<{
    id: string;
    collectionId: string;
    title: string;
    exam: string;
    purchasedAt: string;
    price: number;
  }>;
}

export interface InProgressSessionItem {
  id: string;
  examId: string;
  title: string;
  status: string;
  startedAt: string;
  timeAgo: string;
  examTitle: string;
  totalQuestions: number;
  examType?: string;
  exam?: string;
}

export interface ClonedCollectionItem {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  publishStatus: string;
  createdAt: string;
  examCount: number;
  itemCount: number;
  examType?: string;
  exam?: string;
}
