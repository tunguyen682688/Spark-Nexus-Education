import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeaturedCollections } from './use-certification';
import { paginateItems } from '../services/certification-filter.service';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

export interface EditorialBadgeItem {
  title: string;
  desc: string;
  color: string;
}

export function useEditorialPicksContainerLogic() {
  const navigate = useNavigate();
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('All Picks');
  const [selectedExamCategory, setSelectedExamCategory] = useState<string>('All Exams');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const {
    data: editorialCollections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useFeaturedCollections(
    selectedExamCategory === 'All Exams' ? undefined : selectedExamCategory
  );

  const topEditorialBadges: EditorialBadgeItem[] = [
    {
      title: CERTIFICATION_UI_TEXT.editorialPicks.badges.expertCurated,
      desc: CERTIFICATION_UI_TEXT.editorialPicks.badges.expertCuratedDesc,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20',
    },
    {
      title: CERTIFICATION_UI_TEXT.editorialPicks.badges.qualityAssured,
      desc: CERTIFICATION_UI_TEXT.editorialPicks.badges.qualityAssuredDesc,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20',
    },
    {
      title: CERTIFICATION_UI_TEXT.editorialPicks.badges.provenEffective,
      desc: CERTIFICATION_UI_TEXT.editorialPicks.badges.provenEffectiveDesc,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      title: CERTIFICATION_UI_TEXT.editorialPicks.badges.bestValue,
      desc: CERTIFICATION_UI_TEXT.editorialPicks.badges.bestValueDesc,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
    },
  ];

  const filteredEditorialPicks = useMemo(() => {
    return editorialCollections.filter((collectionItem) => {
      const matchExamCategory =
        selectedExamCategory === 'All Exams' ||
        collectionItem.exam === selectedExamCategory;
      const matchDifficultyLevel =
        selectedLevelFilter === 'All Picks' ||
        collectionItem.level === selectedLevelFilter;
      return matchExamCategory && matchDifficultyLevel;
    });
  }, [editorialCollections, selectedExamCategory, selectedLevelFilter]);

  const totalPages = Math.ceil(filteredEditorialPicks.length / pageSize) || 1;

  const paginatedEditorialPicks = useMemo(() => {
    return paginateItems(filteredEditorialPicks, currentPage, pageSize);
  }, [filteredEditorialPicks, currentPage, pageSize]);

  const handleLevelFilterChange = (level: string) => {
    setSelectedLevelFilter(level);
    setCurrentPage(1);
  };

  const handleExamCategoryChange = (examCategory: string) => {
    setSelectedExamCategory(examCategory);
    setCurrentPage(1);
  };

  const handleViewCollectionDetail = (collectionId: string) => {
    navigate(`/certification/collections/${collectionId}`);
  };

  return {
    selectedLevelFilter,
    selectedExamCategory,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    topEditorialBadges,
    filteredEditorialPicks,
    paginatedEditorialPicks,
    handleLevelFilterChange,
    handleExamCategoryChange,
    handleViewCollectionDetail,
  };
}
