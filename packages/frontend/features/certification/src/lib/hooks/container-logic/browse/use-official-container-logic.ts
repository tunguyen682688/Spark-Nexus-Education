import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOfficialCollections, useSaveCollection } from '../../use-certification';
import { paginateItems } from '../../../services/certification-filter.service';

export function useOfficialContainerLogic(onStartExam?: (examId: string) => void) {
  const navigate = useNavigate();
  const [selectedExamCategory, setSelectedExamCategory] = useState<string>('All Exams');
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState<string>('All Levels');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const pageSize = 6;

  const saveCollectionMutation = useSaveCollection();

  const {
    data: officialExamCollections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useOfficialCollections();

  const filteredOfficialCollections = useMemo(() => {
    return officialExamCollections.filter((collectionItem) => {
      const matchExamCategory =
        selectedExamCategory === 'All Exams' ||
        collectionItem.exam === selectedExamCategory;
      const matchDifficultyLevel =
        selectedDifficultyLevel === 'All Levels' ||
        collectionItem.level === selectedDifficultyLevel;
      return matchExamCategory && matchDifficultyLevel;
    });
  }, [officialExamCollections, selectedExamCategory, selectedDifficultyLevel]);

  const totalPages = Math.ceil(filteredOfficialCollections.length / pageSize) || 1;
  const paginatedOfficialCollections = useMemo(() => {
    return paginateItems(filteredOfficialCollections, currentPage, pageSize);
  }, [filteredOfficialCollections, currentPage, pageSize]);

  const handleExamCategoryChange = (examCategory: string) => {
    setSelectedExamCategory(examCategory);
    setCurrentPage(1);
  };

  const handleDifficultyLevelChange = (level: string) => {
    setSelectedDifficultyLevel(level);
    setCurrentPage(1);
  };

  const handleViewCollectionDetail = (collectionId: string) => {
    if (onStartExam) {
      onStartExam(collectionId);
    } else {
      navigate(`/certification/collections/${collectionId}`);
    }
  };

  const handleBookmarkCollection = (collectionId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
    saveCollectionMutation.mutate(collectionId);
  };

  return {
    selectedExamCategory,
    selectedDifficultyLevel,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    filteredOfficialCollections,
    paginatedOfficialCollections,
    bookmarkedIds,
    isLoading,
    isError,
    error,
    refetch,
    handleExamCategoryChange,
    handleDifficultyLevelChange,
    handleViewCollectionDetail,
    handleBookmarkCollection,
  };
}
