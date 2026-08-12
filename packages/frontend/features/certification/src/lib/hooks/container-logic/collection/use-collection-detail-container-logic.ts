import {
  useCollectionDetail,
  useCollectionItems,
  useCollectionReviews,
  useCollectionActivities,
  useStartExamSession,
  useSaveCollection,
  useCloneCollection,
  useReportCollection,
  useFeaturedCollections,
} from '../../use-certification';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@spark-nest-ed/frontend-core-auth';
import type {
  CollectionTabType,
  CollectionViewModel,
  ContentItem,
  UserReview,
  RecentActivity,
} from '../../../types/container-logic-collection.types';

export type { CollectionTabType, CollectionViewModel, ContentItem, UserReview, RecentActivity } from '../../../types/container-logic-collection.types';
export { formatField } from '../../../services/collection-detail-helpers.service';

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
  const { data: relatedCollections = [], isLoading: isLoadingRelated } = useFeaturedCollections();

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

  const handleBack = (onBack?: () => void) => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/certification');
    }
  };

  return {
    activeTab, setActiveTab,
    isCollectionBookmarked, isCollectionCloned,
    isLoading, isError, error, refetch,
    isStartingExamSession, isSaving, isCloning, isReporting,
    collectionViewModel, contentItems, userReviews, recentActivities,
    handleToggleBookmark, handleToggleClone, handleReport,
    handleStartLearning, handleStartRelatedCollectionExam,
    relatedCollections, isLoadingRelated,
    isOwner, handleEditCollection, handleBack,
  };
}
