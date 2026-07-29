export interface UserDownload {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string | null;
  createdAt: Date;
}

export interface CollectionPurchase {
  id: string;
  userId: string;
  collectionId: string;
  purchasedAt: Date;
  amount: number;
  currency: string;
  paymentStatus: string;
}

export interface CollectionReport {
  id: string;
  collectionId: string;
  userId: string;
  reason: string | null;
  status: string;
  createdAt: Date;
}

export interface CollectionFavorite {
  id: string;
  userId: string;
  collectionId: string;
  createdAt: Date;
}

export interface CollectionBookmark {
  id: string;
  userId: string;
  collectionId: string;
  createdAt: Date;
}

export interface CollectionReview {
  id: string;
  collectionId: string;
  userId: string;
  rating: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionDiscussion {
  id: string;
  collectionId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  createdAt: Date;
}
