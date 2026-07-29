import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePracticeHistoryData } from './use-certification';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../constants/certification.constants';

export interface PracticeHistorySessionItem {
  id: string;
  code: string;
  title: string;
  type: 'Mock Test' | 'Practice by Part' | 'AI Practice' | 'Quiz';
  typeBadgeClass: string;
  iconBgClass: string;
  iconType: 'document' | 'headphones' | 'edit' | 'quiz' | 'mic';
  examPart: string;
  scoreDisplay: string;
  scoreSub: string;
  scoreColor: string;
  timeSpent: string;
  dateDisplay: string;
}

export function usePracticeHistoryContainerLogic() {
  const navigate = useNavigate();
  const { data: apiData, isLoading: isApiLoading, isError, refetch } = usePracticeHistoryData();
  const [sessions, setSessions] = useState<PracticeHistorySessionItem[]>([]);

  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [selectedExamFilter, setSelectedExamFilter] = useState('All');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All Time');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeCategoryTab, setActiveCategoryTab] = useState<'All' | 'Mock Tests' | 'Practice by Part' | 'Quizzes' | 'AI Practices'>('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (apiData && typeof apiData === 'object') {
      const fetched = Array.isArray(apiData.items)
        ? (apiData.items as PracticeHistorySessionItem[])
        : [];
      setSessions(fetched);
    }
  }, [apiData]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchTypeFilter =
        selectedTypeFilter === 'All' || session.type === selectedTypeFilter;
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

  const handleViewScorecard = (resultId: string) => {
    navigate(`/certification/result/${resultId}`);
  };

  const handleRetakeTest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/certification/session/${id}`);
  };

  const handleBackToLearning = () => {
    navigate('/certification/library');
  };

  const { toast } = useToast();
  const handleExportHistory = () => {
    toast(CERTIFICATION_UI_TEXT.toast.exportHistory);
  };

  return {
    isApiLoading,
    isError,
    refetch,
    selectedTypeFilter,
    setSelectedTypeFilter,
    selectedExamFilter,
    setSelectedExamFilter,
    selectedSkillFilter,
    setSelectedSkillFilter,
    selectedTimeFilter,
    setSelectedTimeFilter,
    searchQuery,
    setSearchQuery,
    activeCategoryTab,
    setActiveCategoryTab,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    sessions: filteredSessions,
    totalSessionsCount: filteredSessions.length,
    handleViewScorecard,
    handleRetakeTest,
    handleBackToLearning,
    handleExportHistory,
  };
}
