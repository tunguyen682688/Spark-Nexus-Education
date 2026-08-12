import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrendingCollections } from '../../use-certification';
import { paginateItems } from '../../../services/certification-filter.service';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { WhyTrendingReason } from '../../../types/container-logic-browse.types';

export type { WhyTrendingReason } from '../../../types/container-logic-browse.types';

// ===== Constants =====

const WHY_TRENDING_REASONS: WhyTrendingReason[] = [
  { title: CERTIFICATION_UI_TEXT.trending.reasons.highCompletion, desc: CERTIFICATION_UI_TEXT.trending.reasons.highCompletionDesc, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
  { title: CERTIFICATION_UI_TEXT.trending.reasons.popularLearners, desc: CERTIFICATION_UI_TEXT.trending.reasons.popularLearnersDesc, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
  { title: CERTIFICATION_UI_TEXT.trending.reasons.topRated, desc: CERTIFICATION_UI_TEXT.trending.reasons.topRatedDesc, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  { title: CERTIFICATION_UI_TEXT.trending.reasons.examAligned, desc: CERTIFICATION_UI_TEXT.trending.reasons.examAlignedDesc, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
];

// ===== Hook =====

export function useTrendingContainerLogic(onStartExam?: (examId: string) => void) {
  const navigate = useNavigate();
  const [selectedExamCategory, setSelectedExamCategory] = useState<string>('All Exams');
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState<string>('All Levels');
  const [bookmarkedCollectionIds, setBookmarkedCollectionIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const {
    data: trendingCollections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTrendingCollections();

  const filteredTrendingCollections = useMemo(() => {
    return trendingCollections.filter((collectionItem) => {
      const matchExamCategory =
        selectedExamCategory === 'All Exams' ||
        collectionItem.exam === selectedExamCategory;
      const matchDifficultyLevel =
        selectedDifficultyLevel === 'All Levels' ||
        collectionItem.level === selectedDifficultyLevel;
      return matchExamCategory && matchDifficultyLevel;
    });
  }, [trendingCollections, selectedExamCategory, selectedDifficultyLevel]);

  const totalPages = Math.ceil(filteredTrendingCollections.length / pageSize) || 1;

  const paginatedTrendingCollections = useMemo(() => {
    return paginateItems(filteredTrendingCollections, currentPage, pageSize);
  }, [filteredTrendingCollections, currentPage, pageSize]);

  const handleViewCollectionDetail = (collectionId: string) => {
    if (onStartExam) {
      onStartExam(collectionId);
    } else {
      navigate(`/certification/collections/${collectionId}`);
    }
  };

  const handleExamCategoryChange = (category: string) => {
    setSelectedExamCategory(category);
    setCurrentPage(1);
  };

  const handleDifficultyLevelChange = (level: string) => {
    setSelectedDifficultyLevel(level);
    setCurrentPage(1);
  };

  const toggleCollectionBookmark = (collectionId: string) => {
    setBookmarkedCollectionIds((prev) =>
      prev.includes(collectionId) ? prev.filter((id) => id !== collectionId) : [...prev, collectionId]
    );
  };

  return {
    selectedExamCategory,
    selectedDifficultyLevel,
    bookmarkedCollectionIds,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    trendingCollections,
    filteredTrendingCollections,
    paginatedTrendingCollections,
    whyTrendingReasons: WHY_TRENDING_REASONS,
    isLoading,
    isError,
    error,
    refetch,
    handleViewCollectionDetail,
    handleExamCategoryChange,
    handleDifficultyLevelChange,
    toggleCollectionBookmark,
  };
}
