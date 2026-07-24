import {
  useCollectionDetail,
  useStartExamSession,
  useSaveCollection,
  useCloneCollection,
  useReportCollection,
} from './use-certification';
import { useState } from 'react';

export type CollectionTabType =
  | 'overview'
  | 'content'
  | 'statistics'
  | 'reviews'
  | 'activity'
  | 'related';

export interface CollectionViewModel {
  id: string;
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
  duration?: string;
  items?: string;
}

export interface UserReview {
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

export const formatField = (
  value: string | number | undefined,
  fallback = '\u2014'
): string =>
  value !== undefined && value !== null && value !== '' ? String(value) : fallback;

export function useCollectionDetailContainerLogic(
  collectionId: string,
  onStartLearning?: (examId: string) => void
) {
  const [activeTab, setActiveTab] = useState<CollectionTabType>('overview');
  const [isCollectionBookmarked, setIsCollectionBookmarked] = useState(false);
  const [isCollectionCloned, setIsCollectionCloned] = useState(false);

  const {
    data: rawCollectionData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCollectionDetail(collectionId);

  const { mutate: startExamSession, isPending: isStartingExamSession } =
    useStartExamSession();
  const { mutate: saveCollection, isPending: isSaving } = useSaveCollection();
  const { mutate: cloneCollection, isPending: isCloning } =
    useCloneCollection();
  const { mutate: reportCollection, isPending: isReporting } =
    useReportCollection();

  const collectionViewModel: CollectionViewModel = {
    id: rawCollectionData?.id || collectionId,
    title: rawCollectionData?.title,
    subtitle: rawCollectionData?.subtitle || rawCollectionData?.desc,
    author: rawCollectionData?.author,
    authorRole: rawCollectionData?.authorRole,
    authorAvatar: rawCollectionData?.avatar,
    rating: rawCollectionData?.rating,
    reviewsCount: rawCollectionData?.reviews,
    downloads: rawCollectionData?.learners,
    followers: rawCollectionData?.followers,
    clones: rawCollectionData?.clones,
    itemsCount:
      rawCollectionData?.itemsCount ??
      Number(rawCollectionData?.questions ?? 0),
    exam: rawCollectionData?.exam,
    level: rawCollectionData?.level,
    targetBand: rawCollectionData?.targetBand,
    cefrLevel: rawCollectionData?.cefrLevel,
    language: rawCollectionData?.language,
    updatedDate: rawCollectionData?.updated,
    totalSize: rawCollectionData?.totalSize,
    tags: rawCollectionData?.tags ?? [],
  };

  const contentItems: ContentItem[] = rawCollectionData?.itemsList ?? [];
  const userReviews: UserReview[] = rawCollectionData?.reviewsList ?? [];
  const recentActivities: RecentActivity[] =
    rawCollectionData?.activitiesList ?? [];

  const handleToggleBookmark = () => {
    saveCollection(collectionViewModel.id, {
      onSuccess: () => setIsCollectionBookmarked((prev) => !prev),
    });
  };

  const handleToggleClone = () => {
    cloneCollection(collectionViewModel.id, {
      onSuccess: () => setIsCollectionCloned(true),
    });
  };

  const handleReport = () => {
    reportCollection({
      id: collectionViewModel.id,
      reason: 'Content review request',
    });
  };

  const handleStartLearning = (examItemId?: string) => {
    const targetExamId = examItemId || collectionViewModel.id;
    if (onStartLearning) {
      onStartLearning(targetExamId);
    } else {
      startExamSession(targetExamId);
    }
  };

  const handleStartRelatedCollectionExam = (relatedCollectionId: string) => {
    if (onStartLearning) {
      onStartLearning(relatedCollectionId);
    } else {
      startExamSession(relatedCollectionId);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isCollectionBookmarked,
    isCollectionCloned,
    isLoading,
    isError,
    error,
    refetch,
    isStartingExamSession,
    isSaving,
    isCloning,
    isReporting,
    collectionViewModel,
    contentItems,
    userReviews,
    recentActivities,
    handleToggleBookmark,
    handleToggleClone,
    handleReport,
    handleStartLearning,
    handleStartRelatedCollectionExam,
  };
}
