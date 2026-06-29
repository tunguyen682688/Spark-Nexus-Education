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

  // Read search parameters directly from the URL to avoid double-sync state issues
  const category = fixedCategory || getInitialCategory(location.pathname, searchParams);
  const difficulty = searchParams.get('difficulty') || 'all';

  // Keep local state for searchQuery to make typing in input field snappy (not lagging)
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<string>('newest'); // 'newest' | 'views' | 'subtitles'
  const limit = 6; // Reduced limit for optimization

  // 1. Sync local search query state FROM URL (e.g. back/forward button or reset filter)
  const urlQuery = searchParams.get('q') || '';
  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  // 2. Debounce local search query state updates BACK to URL search params
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const currentVal = searchParams.get('q') || '';
      if (searchQuery !== currentVal) {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) {
          params.set('q', searchQuery);
        } else {
          params.delete('q');
        }
        setSearchParams(params, { replace: true }); // Use replace to avoid polluting browser history on typing
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchParams, setSearchParams]);

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
