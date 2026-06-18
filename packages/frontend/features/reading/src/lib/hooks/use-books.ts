import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useInfiniteArticles, useReadingDashboard, useInteractArticle } from './use-reading';

export function useBooks() {
  // States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCefr, setSelectedCefr] = useState<string[]>([]); // Multi-select CEFR
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Selected tags
  const [cefrSliderVal, setCefrSliderVal] = useState<number>(3); // Slider (0: A1, 1: B1, 2: C1, 3: C2)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'academic' | 'book'>('all');
  const interactMutation = useInteractArticle();

  // Range text for CEFR Slider
  const cefrRangeText = useMemo(() => {
    if (cefrSliderVal === 0) return 'A1';
    if (cefrSliderVal === 1) return 'A1 - B1';
    if (cefrSliderVal === 2) return 'B1 - C1';
    return 'B2 - C2'; // Default matching mockup
  }, [cefrSliderVal]);

  // Fetch articles with category filter
  const {
    data: booksData,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteArticles({
    pageSize: 20,
    filters: {
      category: categoryFilter === 'all' ? undefined : categoryFilter,
    },
  });

  // FlatMap pages and filter local to keep only books and academics
  const allBooks = useMemo(() => {
    const rawBooks = booksData?.pages.flatMap((page) => page.data) || [];
    if (categoryFilter === 'all') {
      return rawBooks.filter((b) => b.category === 'book' || b.category === 'academic');
    }
    return rawBooks;
  }, [booksData?.pages, categoryFilter]);

  // Fetch Dashboard Data for progress and trending
  const { data: dashboardData } = useReadingDashboard();

  const inProgressBooks = useMemo(() => {
    return dashboardData?.bookNook || [];
  }, [dashboardData?.bookNook]);

  // Bookmark Toggle
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    interactMutation.mutate({ id, action: 'BOOKMARK' });
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Tag Toggle
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Cefr Button Toggle
  const handleToggleCefrButton = (level: string) => {
    setSelectedCefr((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  // Local Filter logic matching both mockup filters
  const filteredBooks = useMemo(() => {
    return allBooks.filter((book) => {
      // 1. Search Query
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesAuthor = book.author?.toLowerCase().includes(query) || false;
        const matchesSummary = book.summary?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesAuthor && !matchesSummary) return false;
      }

      // 2. CEFR Difficulty range mapping (Slider)
      const difficulty = book.difficulty.toUpperCase();
      if (cefrSliderVal === 0 && !['A1', 'A2'].includes(difficulty)) return false;
      if (cefrSliderVal === 1 && !['A1', 'A2', 'B1'].includes(difficulty)) return false;
      if (cefrSliderVal === 2 && !['B1', 'B2', 'C1'].includes(difficulty)) return false;
      if (cefrSliderVal === 3 && !['B2', 'C1', 'C2'].includes(difficulty)) return false;

      // 3. Multi-select CEFR buttons filter (if active)
      if (selectedCefr.length > 0 && !selectedCefr.includes(difficulty)) return false;

      // 4. Discipline Tags Filter (intersection check if active)
      if (selectedTags.length > 0) {
        const bookTagsLower = book.tags.map((t) => t.toLowerCase());
        const hasMatchingTag = selectedTags.some((tag) =>
          bookTagsLower.includes(tag.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [allBooks, searchTerm, cefrSliderVal, selectedCefr, selectedTags]);

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
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    selectedCefr,
    setSelectedCefr,
    selectedTags,
    setSelectedTags,
    cefrSliderVal,
    setCefrSliderVal,
    bookmarkedIds,
    categoryFilter,
    setCategoryFilter,
    cefrRangeText,
    isLoading,
    error,
    filteredBooks,
    allBooks,
    isFetchingNextPage,
    loadMoreRef,
    inProgressBooks,
    handleToggleBookmark,
    handleToggleTag,
    handleToggleCefrButton,
  };
}
