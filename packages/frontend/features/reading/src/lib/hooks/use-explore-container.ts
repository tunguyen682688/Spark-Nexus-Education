import { useState, useEffect } from 'react';
import { useArticles, useCommunityArticles } from './use-reading';

export function useExploreContainer() {
  const [activeLevel, setActiveLevel] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const commonFilters = activeLevel ? { difficulty: activeLevel } : {};

  // Fetch Featured Research
  const { data: featuredData, isLoading: isFeaturedLoading } = useArticles({
    limit: 1,
    search: debouncedSearch || undefined,
    filters: { ...commonFilters, category: 'academic' },
  });

  // Fetch Latest News
  const { data: newsData, isLoading: isNewsLoading } = useArticles({
    limit: 2,
    search: debouncedSearch || undefined,
    filters: { ...commonFilters, category: 'news' },
  });

  // Fetch New Books
  const { data: booksData, isLoading: isBooksLoading } = useArticles({
    limit: 3,
    search: debouncedSearch || undefined,
    filters: { ...commonFilters, category: 'book' },
  });

  // Fetch Community Articles
  const { data: communityData, isLoading: isCommunityLoading } = useCommunityArticles('trending', 3);

  const featuredArticle = featuredData?.data?.[0];
  const latestNews = newsData?.data;
  const newBooks = booksData?.data;
  const topShared = communityData?.data?.slice(0, 3);

  return {
    activeLevel,
    setActiveLevel,
    searchTerm,
    setSearchTerm,
    featuredArticle,
    isFeaturedLoading,
    latestNews,
    isNewsLoading,
    newBooks,
    isBooksLoading,
    topShared,
    isCommunityLoading,
  };
}
