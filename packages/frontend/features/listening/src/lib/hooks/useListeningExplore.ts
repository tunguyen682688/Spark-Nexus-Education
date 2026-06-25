import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useInfiniteListeningMaterials } from './index';

function getInitialCategory(pathname: string, searchParams: URLSearchParams): string {
  if (pathname.includes('/podcasts')) return 'podcast';
  if (pathname.includes('/videos')) return 'video';
  if (pathname.includes('/audiobooks')) return 'audio';
  if (pathname.includes('/practice')) return 'exam';
  if (pathname.includes('/news')) return 'news';

  return searchParams.get('category') || 'all';
}

export function useListeningExplore() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // State values
  const [category, setCategory] = useState<string>(getInitialCategory(location.pathname, searchParams));
  const [difficulty, setDifficulty] = useState<string>(searchParams.get('difficulty') || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<string>('newest'); // 'newest' | 'views' | 'subtitles'
  const limit = 6; // Reduced limit for optimization

  // Update states if category or difficulty changes in URL
  useEffect(() => {
    const cat = getInitialCategory(location.pathname, searchParams);
    setCategory(cat);
  }, [location.pathname, searchParams]);

  // Sync state changes with URL Search Params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (category !== 'all') params.category = category;
    if (difficulty !== 'all') params.difficulty = difficulty;
    if (searchQuery) params.q = searchQuery;
    setSearchParams(params);
  }, [category, difficulty, searchQuery, setSearchParams]);

  // Fetch materials params
  const apiParams: {
    limit: number;
    q?: string;
    category?: string;
    isCommunity?: boolean;
    difficulty?: string;
  } = {
    limit,
    q: searchQuery || undefined,
  };

  // Set category query filter
  if (category !== 'all') {
    if (category === 'community') {
      apiParams.isCommunity = true;
    } else {
      apiParams.category = category;
      apiParams.isCommunity = false;
    }
  }

  // Set difficulty level filter
  if (difficulty !== 'all') {
    apiParams.difficulty = difficulty;
  }

  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteListeningMaterials(apiParams);

  const materials = data?.pages.flatMap((page) => page.items) || [];
  const lastPage = data?.pages[data.pages.length - 1];
  const meta = lastPage?.meta || { total: 0, page: 1, limit, totalPages: 1 };

  // Client-side sorting logic
  const getSortedMaterials = () => {
    const list = [...materials];
    if (sortBy === 'views') {
      return list.sort((a, b) => b.viewCount - a.viewCount);
    }
    if (sortBy === 'subtitles') {
      return list.sort((a, b) => (b.subtitles?.length || 0) - (a.subtitles?.length || 0));
    }
    return list;
  };

  const sortedMaterials = getSortedMaterials();

  const handleResetFilters = () => {
    setCategory('all');
    setDifficulty('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  const handleDifficultyChange = (newDiff: string) => {
    setDifficulty(newDiff);
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
  };

  // Intersection Observer callback ref for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return {
    category,
    difficulty,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortedMaterials,
    meta,
    isLoading,
    error,
    handleResetFilters,
    handleDifficultyChange,
    handleCategoryChange,
    navigate,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef,
  };
}
