export type CollectionTabType = 'overview' | 'content' | 'statistics' | 'reviews' | 'activity' | 'related';

export interface CollectionViewModel {
  id: string;
  ownerId?: string;
  title?: string;
  subtitle?: string;
  author?: string;
  authorRole?: string;
  authorAvatar?: string;
  rating?: string;
  reviewsCount?: string;
  downloads?: string;
  followers?: string;
  clones?: string;
  itemsCount: number;
  exam?: string;
  level?: string;
  targetBand?: string;
  cefrLevel?: string;
  language?: string;
  updatedDate?: string;
  totalSize?: string;
  tags: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  type: string;
  duration?: number;
  totalQuestions?: number;
  certificationType?: string | null;
}

export interface UserReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  text: string;
}

export interface RecentActivity {
  user: string;
  action: string;
  time: string;
}
