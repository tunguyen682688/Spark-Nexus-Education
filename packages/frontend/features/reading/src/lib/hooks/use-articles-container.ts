import { useState, useEffect, useRef, useCallback } from 'react';
import { useInfiniteArticles } from './use-reading';

export function useArticlesContainer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Query articles with infinite query hook
  const {
    data: articlesData,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteArticles({
    pageSize: 12,
    q: debouncedSearch || undefined,
    filters: {
      difficulty: selectedLevel || undefined,
      category: selectedCategory || undefined,
    },
  });

  // FlatMap pages to a single articles list
  const articles = articlesData?.pages.flatMap((page) => page.data) || [];

  // Intersection Observer callback ref to load more items on scroll
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLevel('');
    setSelectedCategory('');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedLevel,
    setSelectedLevel,
    selectedCategory,
    setSelectedCategory,
    articles,
    isLoading,
    isError,
    isFetchingNextPage,
    loadMoreRef,
    handleResetFilters,
  };
}
