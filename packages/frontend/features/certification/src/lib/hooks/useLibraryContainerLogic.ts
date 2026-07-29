import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useSavedCollections,
  useSaveCollection,
  useCertificationDashboard,
  usePracticeHistoryData,
  useInProgressSessions,
  useClonedCollections,
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
  const { mutate: saveCollection, isPending: isUnbookmarking } = useSaveCollection();

  const { data: practiceHistoryData, isLoading: isLoadingHistory, isError: isErrorHistory, refetch: refetchHistory } = usePracticeHistoryData();
  const { data: inProgressData, isLoading: isLoadingInProgress, isError: isErrorInProgress, refetch: refetchInProgress } = useInProgressSessions();
  const { data: clonedData, isLoading: isLoadingCloned, isError: isErrorCloned, refetch: refetchCloned } = useClonedCollections();

  const filterByExamAndSearch = (items: ExamCollection[]) => {
    return items.filter((item) => {
      const matchExam =
        selectedExamFilter === 'All' ||
        item.exam?.toUpperCase() === selectedExamFilter.toUpperCase();
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchExam && matchSearch;
    });
  };

  const sortCollections = (items: ExamCollection[]) => {
    const sorted = [...items];
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => {
        const dateA = (a as unknown as Record<string, unknown>).updatedAt as string | undefined;
        const dateB = (b as unknown as Record<string, unknown>).updatedAt as string | undefined;
        if (dateA && dateB) return new Date(dateB).getTime() - new Date(dateA).getTime();
        return 0;
      });
    }
    return sorted;
  };

  const savedCollections = useMemo(() => {
    if (!savedCollectionsData) return [];
    return sortCollections(filterByExamAndSearch(savedCollectionsData));
  }, [savedCollectionsData, selectedExamFilter, searchQuery, sortBy]);

  const totalSavedCount = savedCollectionsData?.length ?? 0;

  const inProgressSessions = useMemo(() => {
    const items = inProgressData?.items || [];
    if (selectedExamFilter === 'All') return items;
    return items.filter((s: Record<string, unknown>) => {
      const examType = (s.examType || s.exam || '') as string;
      return examType.toUpperCase() === selectedExamFilter.toUpperCase();
    });
  }, [inProgressData, selectedExamFilter]);

  const practiceHistoryItems = useMemo(() => {
    const items = practiceHistoryData?.items || [];
    if (selectedExamFilter === 'All') return items;
    return items.filter((h: Record<string, unknown>) => {
      const examType = (h.examType || h.exam || '') as string;
      return examType.toUpperCase() === selectedExamFilter.toUpperCase();
    });
  }, [practiceHistoryData, selectedExamFilter]);

  const clonedCollections = useMemo(() => {
    const items = clonedData?.items || [];
    if (selectedExamFilter === 'All') return items;
    return items.filter((c: Record<string, unknown>) => {
      const examType = (c.examType || c.exam || '') as string;
      return examType.toUpperCase() === selectedExamFilter.toUpperCase();
    });
  }, [clonedData, selectedExamFilter]);

  const handleUnbookmark = (collectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bỏ lưu bộ sưu tập này?')) return;
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
    savedCollections,
    totalSavedCount,
    dashboardStats,
    isLoadingSaved,
    isErrorSaved,
    isUnbookmarking,
    refetchSaved,
    inProgressSessions,
    isLoadingInProgress,
    isErrorInProgress,
    practiceHistoryItems,
    isLoadingHistory,
    isErrorHistory,
    clonedCollections,
    isLoadingCloned,
    isErrorCloned,
    refetchInProgress,
    refetchHistory,
    refetchCloned,
    handleUnbookmark,
    handleOpenCollection,
    handleStartExam,
    handleBackToDashboard,
  };
}
