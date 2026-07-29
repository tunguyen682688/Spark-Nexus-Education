import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavoritesData, useAddFavorite, useRemoveFavorite } from './use-certification';
import { paginateItems } from '../services/certification-filter.service';

export interface FavoriteItem {
  id: string;
  title: string;
  type: 'Collection' | 'Test' | 'Question Set' | 'Vocabulary Set';
  itemCountText: string;
  progressPercent: number;
  progressText: string;
  progressBarClass: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  addedDate: string;
  iconType: 'ielts' | 'toeic' | 'listening' | 'reading' | 'vocabulary' | 'speaking' | 'grammar';
  bannerBgClass: string;
  isFavorited: boolean;
}

export function useFavoritesContainerLogic() {
  const navigate = useNavigate();
  const { data: apiData, isLoading: isApiLoading, isError, refetch } = useFavoritesData();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [activeTab, setActiveTab] = useState<
    'All' | 'Collections' | 'Tests' | 'Questions' | 'Vocabulary'
  >('All');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'name'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    if (apiData && typeof apiData === 'object') {
      const fetched = Array.isArray(apiData.items)
        ? (apiData.items as unknown as FavoriteItem[])
        : [];
      setItems(fetched);
    }
  }, [apiData]);

  // Filter & Sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchTab =
        activeTab === 'All' ||
        (activeTab === 'Collections' && item.type === 'Collection') ||
        (activeTab === 'Tests' && item.type === 'Test') ||
        (activeTab === 'Questions' && item.type === 'Question Set') ||
        (activeTab === 'Vocabulary' && item.type === 'Vocabulary Set');
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCountText.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => {
        const valA = parseFloat(a.stat1Value.replace(/[^0-9.]/g, '')) || 0;
        const valB = parseFloat(b.stat1Value.replace(/[^0-9.]/g, '')) || 0;
        return valB - valA;
      });
    }

    return result;
  }, [items, activeTab, searchQuery, sortBy]);

  // Reset page when filter/search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy]);

  const totalCount = filteredAndSortedItems.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    return paginateItems(filteredAndSortedItems, currentPage, pageSize);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  // Dynamic Category breakdown metrics for sidebar
  const categoryBreakdown = useMemo(() => {
    const counts = {
      Collections: 0,
      Tests: 0,
      Questions: 0,
      Vocabulary: 0,
    };
    items.forEach((it) => {
      if (it.type === 'Collection') counts.Collections++;
      else if (it.type === 'Test') counts.Tests++;
      else if (it.type === 'Question Set') counts.Questions++;
      else if (it.type === 'Vocabulary Set') counts.Vocabulary++;
    });

    return [
      { label: 'Exam Collections', count: counts.Collections },
      { label: 'Mock Practice Tests', count: counts.Tests },
      { label: 'Selected Questions', count: counts.Questions },
      { label: 'Vocabulary Lists', count: counts.Vocabulary },
    ];
  }, [items]);

  const handleRemoveFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
    removeFavoriteMutation.mutate(id);
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find((it) => it.id === id);
    if (!item) return;

    const newFavoritedState = !item.isFavorited;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, isFavorited: newFavoritedState } : it
      )
    );

    if (newFavoritedState) {
      addFavoriteMutation.mutate(id);
    } else {
      removeFavoriteMutation.mutate(id);
    }
  };

  const handleOpenItem = (id: string) => {
    navigate(`/certification/collections/${id}`);
  };

  const handleBackToLearning = () => {
    navigate('/certification/library');
  };

  return {
    isApiLoading,
    isError,
    refetch,
    activeTab,
    setActiveTab,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalCount,
    allFavoritesCount: items.length,
    items: paginatedItems,
    categoryBreakdown,
    handleToggleFavorite,
    handleRemoveFavorite,
    handleOpenItem,
    handleBackToLearning,
  };
}
