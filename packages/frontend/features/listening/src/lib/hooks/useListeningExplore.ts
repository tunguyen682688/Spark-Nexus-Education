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

function getPathFromCategory(cat: string): string {
  switch (cat) {
    case 'podcast': return '/listening/podcasts';
    case 'video': return '/listening/videos';
    case 'audio': return '/listening/audiobooks';
    case 'exam': return '/listening/practice';
    case 'news': return '/listening/news';
    default: return '/listening/explore';
  }
}

interface UseListeningExploreOptions {
  fixedCategory?: string;
}

export function useListeningExplore(options?: UseListeningExploreOptions) {
  const fixedCategory = options?.fixedCategory;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // State values
  const [category, setCategory] = useState<string>(
    fixedCategory || getInitialCategory(location.pathname, searchParams)
  );
  const [difficulty, setDifficulty] = useState<string>(searchParams.get('difficulty') || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<string>('newest'); // 'newest' | 'views' | 'subtitles'
  const limit = 6; // Reduced limit for optimization

  // Update states if category, difficulty or query changes in URL (e.g. back/forward button)
  useEffect(() => {
    const cat = fixedCategory || getInitialCategory(location.pathname, searchParams);
    setCategory(cat);

    const diff = searchParams.get('difficulty') || 'all';
    setDifficulty(diff);

    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [location.pathname, searchParams, fixedCategory]);

  // Sync state changes with URL Search Params
  useEffect(() => {
    const params: Record<string, string> = {};

    // Only set category search param if we are on the base '/listening/explore' page
    // and the category is not 'all'.
    const isSpecificPath = 
      fixedCategory ||
      location.pathname.includes('/podcasts') ||
      location.pathname.includes('/videos') ||
      location.pathname.includes('/audiobooks') ||
      location.pathname.includes('/practice') ||
      location.pathname.includes('/news');

    if (!isSpecificPath && category !== 'all') {
      params.category = category;
    }

    if (difficulty !== 'all') params.difficulty = difficulty;
    if (searchQuery) params.q = searchQuery;

    const currentParams = Object.fromEntries(searchParams.entries());
    const hasChanged = 
      params.category !== currentParams.category ||
      params.difficulty !== currentParams.difficulty ||
      params.q !== currentParams.q;

    if (hasChanged) {
      setSearchParams(params);
    }
  }, [category, difficulty, searchQuery, location.pathname, searchParams, setSearchParams, fixedCategory]);

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
    setSortBy('newest');
    navigate(fixedCategory ? getPathFromCategory(fixedCategory) : '/listening/explore');
  };

  const handleDifficultyChange = (newDiff: string) => {
    const params = new URLSearchParams(searchParams);
    if (newDiff === 'all') {
      params.delete('difficulty');
    } else {
      params.set('difficulty', newDiff);
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (newCat: string) => {
    const newPath = getPathFromCategory(newCat);
    const params = new URLSearchParams(searchParams);

    if (newCat === 'community') {
      params.set('category', 'community');
    } else {
      params.delete('category');
    }

    navigate({
      pathname: newPath,
      search: params.toString() ? `?${params.toString()}` : '',
    });
  };

  const handleApplyPreset = (presetCat: string, presetDiff: string) => {
    const newPath = getPathFromCategory(presetCat);
    const params = new URLSearchParams(searchParams);

    if (presetCat === 'community') {
      params.set('category', 'community');
    } else {
      params.delete('category');
    }

    if (presetDiff === 'all') {
      params.delete('difficulty');
    } else {
      params.set('difficulty', presetDiff);
    }

    navigate({
      pathname: newPath,
      search: params.toString() ? `?${params.toString()}` : '',
    });
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
    handleApplyPreset,
    navigate,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef,
  };
}
