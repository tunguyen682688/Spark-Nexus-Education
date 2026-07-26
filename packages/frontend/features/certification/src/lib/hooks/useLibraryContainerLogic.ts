import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useSavedCollections,
  useSaveCollection,
  useCertificationDashboard,
  useFeaturedCollections,
} from './use-certification';
import { ExamCollection } from '../types';

export type LibraryTabType = 'saved' | 'in_progress' | 'history' | 'my_clones';

export function useLibraryContainerLogic() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LibraryTabType>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  const {
    data: savedCollectionsData,
    isLoading: isLoadingSaved,
    isError: isErrorSaved,
    refetch: refetchSaved,
  } = useSavedCollections();

  const { data: dashboardStats } = useCertificationDashboard();
  const { data: featuredData } = useFeaturedCollections();
  const { mutate: saveCollection, isPending: isUnbookmarking } = useSaveCollection();

  // Combine fetched saved data or fallback to a portion of featured collections if empty
  const rawSavedCollections: ExamCollection[] = useMemo(() => {
    if (savedCollectionsData && savedCollectionsData.length > 0) {
      return savedCollectionsData;
    }
    return featuredData ? featuredData.slice(0, 3) : [];
  }, [savedCollectionsData, featuredData]);

  // Filtered & Sorted saved collections
  const filteredSavedCollections = useMemo(() => {
    return rawSavedCollections.filter((collection) => {
      const matchExam =
        selectedExamFilter === 'All' ||
        collection.exam?.toUpperCase() === selectedExamFilter.toUpperCase();
      const matchSearch =
        !searchQuery ||
        collection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (collection.description &&
          collection.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchExam && matchSearch;
    });
  }, [rawSavedCollections, selectedExamFilter, searchQuery]);

  const handleUnbookmark = (collectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveCollection(collectionId, {
      onSuccess: () => refetchSaved(),
    });
  };

  const handleOpenCollection = (collectionId: string) => {
    navigate(`/certification/collections/${collectionId}`);
  };

  const handleStartExam = (examId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/certification/exams/${examId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/certification');
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedExamFilter,
    setSelectedExamFilter,
    sortBy,
    setSortBy,
    savedCollections: filteredSavedCollections,
    totalSavedCount: rawSavedCollections.length,
    dashboardStats,
    isLoadingSaved,
    isErrorSaved,
    isUnbookmarking,
    refetchSaved,
    handleUnbookmark,
    handleOpenCollection,
    handleStartExam,
    handleBackToDashboard,
  };
}
