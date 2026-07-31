import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeaturedCollections } from '../../use-certification';
import { paginateItems } from '../../../services/certification-filter.service';

export function useExamsContainerLogic(onStartExam?: (examId: string) => void) {
  const navigate = useNavigate();
  const [selectedExamCategory, setSelectedExamCategory] = useState<string>('All');
  const [collectionSearchQuery, setCollectionSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const {
    data: examCollections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useFeaturedCollections(
    selectedExamCategory === 'All' ? undefined : selectedExamCategory,
    collectionSearchQuery
  );

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

  const handleSearchQueryChange = (query: string) => {
    setCollectionSearchQuery(query);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(examCollections.length / pageSize) || 1;
  const paginatedExamCollections = useMemo(() => {
    return paginateItems(examCollections, currentPage, pageSize);
  }, [examCollections, currentPage, pageSize]);

  return {
    selectedExamCategory,
    collectionSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    examCollections,
    paginatedExamCollections,
    isLoading,
    isError,
    error,
    refetch,
    handleViewCollectionDetail,
    handleExamCategoryChange,
    handleSearchQueryChange,
  };
}
