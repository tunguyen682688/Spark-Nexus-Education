import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePracticeHistoryData } from '../../use-certification';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../../constants/certification.constants';
import type { PracticeHistoryResponse } from '../../../types';
import type { PracticeHistorySessionItem } from '../../../types/container-logic-learning.types';

export type { PracticeHistorySessionItem } from '../../../types/container-logic-learning.types';

// ===== Hook =====

export function usePracticeHistoryContainerLogic() {
  const navigate = useNavigate();
  const { data: apiData, isLoading: isApiLoading, isError, refetch } = usePracticeHistoryData();
  const { toast } = useToast();

  // UI state
  const [sessions, setSessions] = useState<PracticeHistorySessionItem[]>([]);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'All' | 'Mock Tests' | 'Practice by Part' | 'Quizzes' | 'AI Practices'>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [selectedExamFilter, setSelectedExamFilter] = useState('All');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);

  // Hydrate from API
  useEffect(() => {
    if (apiData) {
      const response = apiData as unknown as PracticeHistoryResponse;
      setSessions((response.items ?? []) as PracticeHistorySessionItem[]);
    }
  }, [apiData]);

  // ===== Derived: filtered sessions =====

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchTypeFilter = selectedTypeFilter === 'All' || session.type === selectedTypeFilter;
      const matchCategoryTab =
        activeCategoryTab === 'All' ||
        (activeCategoryTab === 'Mock Tests' && session.type === 'Mock Test') ||
        (activeCategoryTab === 'Practice by Part' && session.type === 'Practice by Part') ||
        (activeCategoryTab === 'Quizzes' && session.type === 'Quiz') ||
        (activeCategoryTab === 'AI Practices' && session.type === 'AI Practice');
      const matchSearch =
        !searchQuery ||
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.examPart.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTypeFilter && matchCategoryTab && matchSearch;
    });
  }, [sessions, selectedTypeFilter, activeCategoryTab, searchQuery]);

  // ===== Handlers =====

  const handleViewScorecard = (resultId: string) => navigate(`/certification/result/${resultId}`);

  const handleRetakeTest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/certification/session/${id}`);
  };

  const handleBackToLearning = () => navigate('/certification/library');

  const handleExportHistory = () => toast(CERTIFICATION_UI_TEXT.toast.exportHistory);

  return {
    isApiLoading, isError, refetch,
    activeCategoryTab, setActiveCategoryTab,
    selectedTypeFilter, setSelectedTypeFilter,
    selectedExamFilter, setSelectedExamFilter,
    selectedSkillFilter, setSelectedSkillFilter,
    selectedTimeFilter, setSelectedTimeFilter,
    searchQuery, setSearchQuery,
    viewMode, setViewMode,
    currentPage, setCurrentPage,
    sessions: filteredSessions,
    totalSessionsCount: filteredSessions.length,
    handleViewScorecard, handleRetakeTest, handleBackToLearning, handleExportHistory,
  };
}
