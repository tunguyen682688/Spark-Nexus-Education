export interface ExamCollection {
  id: string;
  title: string;
  exam: string;
  subtitle?: string;
  desc?: string;
  description?: string;
  ownerId?: string;
  author?: string;
  authorRole?: string;
  avatar?: string;
  image?: string;
  publishStatus?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  updated?: string;
  examCount?: number;
  itemCount?: number;
  itemsCount?: number;
  mocks?: number | string;
  minis?: number | string;
  questions?: number | string;
  questionsCount?: number;
  level?: string;
  levelColor?: string;
  colorClass?: string;
  duration?: string;
  tag?: string;
  tagColor?: string;
  badgeColor?: string;
  btnColor?: string;
  rating?: string;
  reviews?: string;
  learners?: string;
  downloads?: string;
  rank?: number;
  trend?: string;
  clones?: string;
  followers?: string;
  targetBand?: string;
  cefrLevel?: string;
  language?: string;
  totalSize?: string;
  tags?: string[];
  saved?: boolean;
  bookmarked?: boolean;
  cloned?: boolean;
  itemsList?: Array<{ id: string; title: string; type: string; duration: number; totalQuestions: number; certificationType?: string | null }>;
  reviewsList?: Array<{ id?: string; author: string; avatar?: string; rating: number; date: string; text: string }>;
  activitiesList?: Array<{ user: string; action: string; time: string }>;
}

export interface CollectionDiscussion {
  id: string;
  title: string;
  author: string;
  avatar?: string;
  date: string;
  repliesCount: number;
  content: string;
}

export interface CreateCollectionReviewDto {
  rating: number;
  text: string;
}

export interface CreateCollectionDiscussionDto {
  title: string;
  content: string;
}
