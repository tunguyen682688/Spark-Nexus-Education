import { useState, useEffect } from 'react';
import {
  useReadingDashboard,
  useArticles,
  useCommunityArticles,
} from './use-reading';

export function useArticleHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<{
    category?: string;
    difficulty?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilters]);

  // Fetch dashboard aggregate data
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
  } = useReadingDashboard();

  // Prepare query parameters for discover articles list
  const queryParams = {
    page,
    pageSize: 6,
    sortBy: activeFilters.sortBy,
    sortOrder: activeFilters.sortOrder,
    q: searchTerm || undefined,
    filters: {
      category: activeFilters.category || undefined,
      difficulty: activeFilters.difficulty || undefined,
      status: activeFilters.status || undefined,
    },
  };

  // Fetch discover articles
  const {
    data: discoverData,
    isLoading: isDiscoverLoading,
    isError: isDiscoverError,
  } = useArticles(queryParams);

  // Fetch community articles
  const [communitySort, setCommunitySort] = useState<
    'trending' | 'newest' | 'top'
  >('trending');
  const {
    data: communityData,
    isLoading: isCommunityLoading,
  } = useCommunityArticles(communitySort, 10);

  const [activeTab, setActiveTab] = useState<'official' | 'community'>(
    'official'
  );

  const handleFilterChange = (newFilters: Partial<typeof activeFilters>) => {
    setActiveFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const isPageLoading = isDashboardLoading || isDiscoverLoading;
  const isPageError = isDashboardError || isDiscoverError;

  return {
    searchTerm,
    setSearchTerm,
    activeFilters,
    handleFilterChange,
    isPageLoading,
    isPageError,
    dashboardData,
    discoverData,
    communitySort,
    setCommunitySort,
    communityData,
    isCommunityLoading,
    activeTab,
    setActiveTab,
    page,
    setPage,
    totalPages: discoverData?.meta.totalPages || 1,
  };
}
