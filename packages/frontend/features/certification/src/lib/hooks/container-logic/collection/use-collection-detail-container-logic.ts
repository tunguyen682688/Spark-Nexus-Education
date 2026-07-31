import {
  useCollectionDetail,
  useCollectionItems,
  useCollectionReviews,
  useCollectionActivities,
  useStartExamSession,
  useSaveCollection,
  useCloneCollection,
  useReportCollection,
} from '../../use-certification';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@spark-nest-ed/frontend-core-auth';

// ===== Types =====

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
  duration?: string;
  items?: string;
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

export const formatField = (value: string | number | undefined, fallback = '\u2014'): string =>
  value !== undefined && value !== null && value !== '' ? String(value) : fallback;

// ===== Hook =====

/**
 * Container logic for the Collection Detail page.
 * Fetches collection data, items, reviews, and activities.
 * Provides bookmark/clone/report/start-learning actions.
 */
export function useCollectionDetailContainerLogic(
  collectionId: string,
  onStartLearning?: (examId: string) => void,
) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // UI state
  const [activeTab, setActiveTab] = useState<CollectionTabType>('overview');
  const [isCollectionBookmarked, setIsCollectionBookmarked] = useState(false);
  const [isCollectionCloned, setIsCollectionCloned] = useState(false);

  // Data queries
  const { data: rawCollectionData, isLoading, isError, error, refetch } = useCollectionDetail(collectionId);
  const { data: itemsData } = useCollectionItems(collectionId);
  const { data: reviewsData } = useCollectionReviews(collectionId);
  const { data: activitiesData } = useCollectionActivities(collectionId);

  // Mutations
  const { mutate: startExamSession, isPending: isStartingExamSession } = useStartExamSession();
  const { mutate: saveCollection, isPending: isSaving } = useSaveCollection();
  const { mutate: cloneCollection, isPending: isCloning } = useCloneCollection();
  const { mutate: reportCollection, isPending: isReporting } = useReportCollection();

  // Sync bookmark/clone state from API response
  useEffect(() => {
    if (rawCollectionData) {
      if (rawCollectionData.saved || rawCollectionData.bookmarked) setIsCollectionBookmarked(true);
      if (rawCollectionData.cloned) setIsCollectionCloned(true);
    }
  }, [rawCollectionData]);

  // ===== Derived: view model =====

  const collectionViewModel: CollectionViewModel = useMemo(() => ({
    id: rawCollectionData?.id || collectionId,
    ownerId: rawCollectionData?.ownerId,
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
    itemsCount: rawCollectionData?.itemsCount ?? Number(rawCollectionData?.questions ?? 0),
    exam: rawCollectionData?.exam,
    level: rawCollectionData?.level,
    targetBand: rawCollectionData?.targetBand,
    cefrLevel: rawCollectionData?.cefrLevel,
    language: rawCollectionData?.language,
    updatedDate: rawCollectionData?.updated,
    totalSize: rawCollectionData?.totalSize,
    tags: rawCollectionData?.tags ?? [],
  }), [rawCollectionData, collectionId]);

  // ===== Derived: content data (prefer dedicated queries, fallback to embedded lists) =====

  const contentItems: ContentItem[] = itemsData && itemsData.length > 0 ? itemsData : (rawCollectionData?.itemsList ?? []);

  const userReviews: UserReview[] = reviewsData && reviewsData.length > 0
    ? reviewsData
    : (rawCollectionData?.reviewsList ?? []).map((r, i) => ({
        id: r.id || `fallback-${i}`,
        author: r.author,
        avatar: r.avatar,
        rating: r.rating,
        date: r.date,
        text: r.text,
      }));

  const recentActivities: RecentActivity[] = activitiesData && activitiesData.length > 0
    ? activitiesData
    : (rawCollectionData?.activitiesList ?? []);

  // ===== Derived: ownership =====

  const isOwner = useMemo(() => {
    if (!user?.id || !collectionViewModel.ownerId) return false;
    return user.id === collectionViewModel.ownerId;
  }, [user?.id, collectionViewModel.ownerId]);

  // ===== Handlers =====

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
    reportCollection({ id: collectionViewModel.id, reason: 'Content review request' });
  };

  const handleStartLearning = (examItemId?: string) => {
    const targetExamId = examItemId || collectionViewModel.id;
    if (onStartLearning) onStartLearning(targetExamId);
    else startExamSession(targetExamId);
  };

  const handleStartRelatedCollectionExam = (relatedCollectionId: string) => {
    if (onStartLearning) onStartLearning(relatedCollectionId);
    else startExamSession(relatedCollectionId);
  };

  const handleEditCollection = () => {
    navigate(`/certification/collection-editor/${collectionViewModel.id}`);
  };

  return {
    activeTab, setActiveTab,
    isCollectionBookmarked, isCollectionCloned,
    isLoading, isError, error, refetch,
    isStartingExamSession, isSaving, isCloning, isReporting,
    collectionViewModel, contentItems, userReviews, recentActivities,
    handleToggleBookmark, handleToggleClone, handleReport,
    handleStartLearning, handleStartRelatedCollectionExam,
    isOwner, handleEditCollection,
  };
}
