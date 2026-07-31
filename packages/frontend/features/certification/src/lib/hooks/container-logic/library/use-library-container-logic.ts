import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useSavedCollections,
  useSaveCollection,
  useCertificationDashboard,
  usePracticeHistoryData,
  useInProgressSessions,
  useClonedCollections,
} from '../../use-certification';
import type { ExamCollection } from '../../../types';

// ===== Types =====

export type LibraryTabType = 'saved' | 'in_progress' | 'history' | 'my_clones';

// ===== Hook =====

export function useLibraryContainerLogic() {
  const navigate = useNavigate();

  // UI state
  const [activeTab, setActiveTab] = useState<LibraryTabType>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'title'>('recent');

  // Data queries
  const { data: savedCollectionsData, isLoading: isLoadingSaved, isError: isErrorSaved, refetch: refetchSaved } = useSavedCollections();
  const { data: dashboardStats } = useCertificationDashboard();
  const { mutate: saveCollection, isPending: isUnbookmarking } = useSaveCollection();
  const { data: practiceHistoryData, isLoading: isLoadingHistory, isError: isErrorHistory, refetch: refetchHistory } = usePracticeHistoryData();
  const { data: inProgressData, isLoading: isLoadingInProgress, isError: isErrorInProgress, refetch: refetchInProgress } = useInProgressSessions();
  const { data: clonedData, isLoading: isLoadingCloned, isError: isErrorCloned, refetch: refetchCloned } = useClonedCollections();

  // ===== Filtering & sorting helpers =====

  const filterByExamAndSearch = (items: ExamCollection[]) => {
    return items.filter((item) => {
      const matchExam = selectedExamFilter === 'All' || item.exam?.toUpperCase() === selectedExamFilter.toUpperCase();
      const matchSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchExam && matchSearch;
    });
  };

  const sortCollections = (items: ExamCollection[]) => {
    const sorted = [...items];
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => {
        if (a.updatedAt && b.updatedAt) return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        return 0;
      });
    }
    return sorted;
  };

  /** Filter items by exam type string match. */
  const filterByExamType = <T extends { examType?: string; exam?: string }>(items: T[]): T[] => {
    if (selectedExamFilter === 'All') return items;
    return items.filter((item) => {
      const examType = (item.examType || item.exam || '') as string;
      return examType.toUpperCase() === selectedExamFilter.toUpperCase();
    });
  };

  // ===== Derived data =====

  const savedCollections = useMemo(() => {
    if (!savedCollectionsData) return [];
    return sortCollections(filterByExamAndSearch(savedCollectionsData));
  }, [savedCollectionsData, selectedExamFilter, searchQuery, sortBy]);

  const totalSavedCount = savedCollectionsData?.length ?? 0;

  const inProgressSessions = useMemo(() => {
    return filterByExamType(inProgressData?.items ?? []);
  }, [inProgressData, selectedExamFilter]);

  const practiceHistoryItems = useMemo(() => {
    // PracticeHistoryResponse items don't have examType — return as-is
    return practiceHistoryData?.items ?? [];
  }, [practiceHistoryData]);

  const clonedCollections = useMemo(() => {
    return filterByExamType(clonedData?.items ?? []);
  }, [clonedData, selectedExamFilter]);

  // ===== Handlers =====

  const handleUnbookmark = (collectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bỏ lưu bộ sưu tập này?')) return;
    saveCollection(collectionId, { onSuccess: () => refetchSaved() });
  };

  const handleOpenCollection = (collectionId: string) => {
    navigate(`/certification/collections/${collectionId}`);
  };

  const handleStartExam = (examId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/certification/exams/${examId}`);
  };

  const handleBackToDashboard = () => navigate('/certification');

  return {
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    selectedExamFilter, setSelectedExamFilter,
    sortBy, setSortBy,
    savedCollections, totalSavedCount, dashboardStats,
    isLoadingSaved, isErrorSaved, isUnbookmarking, refetchSaved,
    inProgressSessions, isLoadingInProgress, isErrorInProgress, refetchInProgress,
    practiceHistoryItems, isLoadingHistory, isErrorHistory, refetchHistory,
    clonedCollections, isLoadingCloned, isErrorCloned, refetchCloned,
    handleUnbookmark, handleOpenCollection, handleStartExam, handleBackToDashboard,
  };
}
