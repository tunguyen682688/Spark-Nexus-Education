import { useState, useEffect, useCallback, useRef } from 'react';
import { useArticles, useInfiniteArticles } from './use-reading';

export function useNewsContainer() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [activeLevel, setActiveLevel] = useState<string>('ALL');
  const [activeDomain, setActiveDomain] = useState<string>('ALL');
  const [activeTime, setActiveTime] = useState<string>('ALL');
  const [activeSort, setActiveSort] = useState<string>('popular');
  const [tipIndex, setTipIndex] = useState<number>(0);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const levelFilter = activeLevel !== 'ALL' ? activeLevel : undefined;
  const tagFilter = activeDomain !== 'ALL' ? activeDomain : undefined;

  // Main Articles Query (For left side list) using infinite query
  const {
    data: articlesData,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteArticles({
    limit: 6, // 6 items per page
    search: debouncedSearch || undefined,
    sortBy: activeSort === 'popular' ? 'viewCount' : 'createdAt',
    sortOrder: 'desc',
    filters: {
      category: 'news',
      ...(levelFilter ? { difficulty: levelFilter } : {}),
      ...(tagFilter ? { tag: tagFilter } : {}),
      ...(activeTime !== 'ALL' ? { timeFilter: activeTime } : {}),
    },
  });

  // Trending Articles Query (For right side trending list)
  const { data: trendingData, isLoading: isTrendingLoading } = useArticles({
    page: 1,
    limit: 5,
    sortBy: 'viewCount',
    sortOrder: 'desc',
    filters: {
      category: 'news',
    },
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setActiveLevel('ALL');
    setActiveDomain('ALL');
    setActiveTime('ALL');
    setActiveSort('popular');
  };

  const handleLevelChange = (val: string) => {
    setActiveLevel(val);
  };

  const handleDomainChange = (val: string) => {
    setActiveDomain(val);
  };

  const handleTimeChange = (val: string) => {
    setActiveTime(val);
  };

  const handleSortChange = (val: string) => {
    setActiveSort(val);
  };

  const handleQuickTagClick = (tag: string) => {
    setActiveDomain(tag.toLowerCase());
  };

  const trendingArticles = trendingData?.data || [];
  const articles = articlesData?.pages.flatMap((p) => p.data) || [];

  // Store dynamic state in refs to avoid re-binding IntersectionObserver callbacks
  const fetchNextPageRef = useRef(fetchNextPage);
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingRef = useRef(isFetchingNextPage || isLoading);

  useEffect(() => {
    fetchNextPageRef.current = fetchNextPage;
    hasNextPageRef.current = hasNextPage;
    isFetchingRef.current = isFetchingNextPage || isLoading;
  });

  // Infinite scroll intersection observer logic (stable callback identity)
  const observer = useRef<IntersectionObserver | null>(null);
  const lastArticleElementRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();

    if (!node) return;

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPageRef.current && !isFetchingRef.current) {
        fetchNextPageRef.current();
      }
    });

    observer.current.observe(node);
  }, []);

  return {
    page: articlesData?.pages[articlesData.pages.length - 1]?.meta.page || 1,
    totalPages: articlesData?.pages[0]?.meta.totalPages || 1,
    articles,
    searchTerm,
    setSearchTerm,
    activeLevel,
    activeDomain,
    activeTime,
    activeSort,
    tipIndex,
    setTipIndex,
    isLoading,
    error,
    isFetching: isFetchingNextPage,
    trendingArticles,
    isTrendingLoading,
    hasMore: hasNextPage,
    lastArticleElementRef,
    handleClearFilters,
    handleLevelChange,
    handleDomainChange,
    handleTimeChange,
    handleSortChange,
    handleQuickTagClick,
  };
}
