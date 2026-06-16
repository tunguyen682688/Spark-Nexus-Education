import React, { useState, useMemo } from 'react';
import { useArticles, useReadingDashboard } from '../hooks/use-reading';
import {
  Button,
  Input,
  Badge,
  Skeleton,
} from '@spark-nest-ed/frontend-shared-components';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  BookOpen,
  Eye,
  LayoutGrid,
  List,
  Bookmark,
  TrendingUp,
  Sparkles,
  Award,
  BookmarkCheck,
  Percent,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ARTICLE_THUMBNAIL, ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { ACADEMIC_DATA, READING_UI_TEXT } from '../constants';
import type { Article } from '../types';

export const AcademicContainer: React.FC = () => {
  const navigate = useNavigate();
  
  // States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCefr, setSelectedCefr] = useState<string[]>([]); // Multi-select CEFR
  const [selectedTags, setSelectedTags] = useState<string[]>(['Neuroscience', 'Physics']); // Default tags highlighted
  const [cefrSliderVal, setCefrSliderVal] = useState<number>(3); // Slider (0: A1, 1: B1, 2: C1, 3: C2)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Range text for CEFR Slider
  const cefrRangeText = useMemo(() => {
    if (cefrSliderVal === 0) return 'A1';
    if (cefrSliderVal === 1) return 'A1 - B1';
    if (cefrSliderVal === 2) return 'B1 - C1';
    return 'B2 - C2'; // Default matching mockup
  }, [cefrSliderVal]);

  // Fetch academic books
  const { data: booksData, isLoading, error } = useArticles({
    limit: 20,
    filters: {
      category: 'academic',
    },
  });

  const allBooks = useMemo(() => booksData?.data || [], [booksData?.data]);
  
  // Fetch Dashboard Data for progress and trending
  const { data: dashboardData } = useReadingDashboard();

  // Filter books locally to support range slider and tag intersections matching the mockup
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

      // 2. CEFR Difficulty range mapping
      const difficulty = book.difficulty.toUpperCase();
      // Slider mapping filter:
      // Slider level 0: A1, A2
      // Slider level 1: A1, A2, B1
      // Slider level 2: B1, B2, C1
      // Slider level 3: B2, C1, C2
      if (cefrSliderVal === 0 && !['A1', 'A2'].includes(difficulty)) return false;
      if (cefrSliderVal === 1 && !['A1', 'A2', 'B1'].includes(difficulty)) return false;
      if (cefrSliderVal === 2 && !['B1', 'B2', 'C1'].includes(difficulty)) return false;
      if (cefrSliderVal === 3 && !['B2', 'C1', 'C2'].includes(difficulty)) return false;

      // 3. Selectable CEFR button filters (if any selected)
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

  // Derive Reading Progress books dynamically from backend
  const inProgressBooks = useMemo(() => {
    return dashboardData?.bookNook || [];
  }, [dashboardData?.bookNook]);

  // Derive Trending Reads from backend
  const trendingReads = useMemo(() => {
    return dashboardData?.trendingPublications.slice(0, 2) || [];
  }, [dashboardData?.trendingPublications]);

  // Bookmark Toggle
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Rendering individual card
  const renderBookCard = (book: Article) => {
    const isBookmarked = bookmarkedIds.has(book.id);
    const difficultyLabel =
      book.difficulty === 'C2'
        ? 'C2 MASTERY'
        : book.difficulty === 'C1'
        ? 'C1 ADVANCED'
        : book.difficulty === 'B2'
        ? 'B2 UPPER INT.'
        : `${book.difficulty} INTERMEDIATE`;

    const difficultyColor =
      book.difficulty.startsWith('C')
        ? book.difficulty === 'C2'
          ? 'bg-red-500/10 text-red-500 border-red-500/20'
          : 'bg-blue-600/10 text-blue-500 border-blue-500/20'
        : 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20';

    if (viewMode === 'list') {
      return (
        <div
          key={book.id}
          onClick={() => navigate(`/reading/article/${book.id}`)}
          className="bg-white dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between gap-6 cursor-pointer hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-16 h-20 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-800/80 relative group-hover:scale-[1.02] transition-transform shadow-sm">
              <img
                src={book.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL;
                }}
                className="w-full h-full object-cover"
                alt={book.title}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-500 transition-colors line-clamp-1">
                {book.title}
              </h3>
              <p className="text-slate-450 dark:text-slate-450 text-xs font-semibold mt-0.5">
                {book.author}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={`text-[9px] font-bold py-0.5 px-2 rounded-md ${difficultyColor} border`}>
                  {difficultyLabel}
                </Badge>
                {book.tags?.[0] && (
                  <Badge className="bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-850 text-[9px] font-bold py-0.5 px-2 rounded-md uppercase tracking-wider">
                    {book.tags[0]}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right text-xs font-semibold text-slate-450 dark:text-slate-500 space-y-1">
              <p className="flex items-center justify-end gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> {book.wordCount} {READING_UI_TEXT.academic.PAGES}
              </p>
              <p className="flex items-center justify-end gap-1.5">
                <Eye className="w-3.5 h-3.5" /> {book.viewCount || 0} {READING_UI_TEXT.academic.VIEWS}
              </p>
            </div>

            <button
              onClick={(e) => handleToggleBookmark(book.id, e)}
              className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 rounded-xl transition-colors cursor-pointer border border-slate-150/40 dark:border-slate-800"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={book.id}
        onClick={() => navigate(`/reading/article/${book.id}`)}
        className="bg-white dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group min-h-[190px]"
      >
        <div className="flex gap-4">
          {/* 3D cover container */}
          <div className="w-20 h-28 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-250/60 dark:border-slate-800/80 relative shadow-md group-hover:scale-103 transition-transform">
            <img
              src={book.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL;
              }}
              className="w-full h-full object-cover"
              alt={book.title}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-500 transition-colors line-clamp-2">
              {book.title}
            </h3>
            <p className="text-slate-450 dark:text-slate-450 text-[11px] font-semibold">
              {book.author}
            </p>

            <div className="flex flex-col gap-1.5 pt-1">
              <div>
                <Badge className={`text-[9px] font-bold py-0.5 px-2 rounded-md ${difficultyColor} border`}>
                  {difficultyLabel}
                </Badge>
              </div>
              {book.tags?.[0] && (
                <div>
                  <Badge className="bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 text-[9px] font-bold py-0.5 px-2 rounded-md uppercase tracking-wider">
                    {book.tags[0]}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-100 dark:border-slate-850/60 text-[11px] text-slate-400 dark:text-slate-500 font-bold">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> {book.wordCount} {READING_UI_TEXT.academic.PAGES}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {book.viewCount || 0} {READING_UI_TEXT.academic.VIEWS}
            </span>
          </div>

          <button
            onClick={(e) => handleToggleBookmark(book.id, e)}
            className="text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate(ROUTES.READING.EXPLORE)}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 transition-colors mb-6 group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {READING_UI_TEXT.academic.BACK_TO_EXPLORE}
      </button>

      {/* Hero Featured SPOTLIGHT Card */}
      <div className="mb-8 bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row group shadow-lg min-h-[300px]">
        {/* Cover fold backdrop */}
        <div className="md:w-1/2 relative min-h-[200px] md:h-auto overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-102 transition-transform duration-700"
            alt="Curriculum Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent"></div>
          
          {/* Spotlight Graphic Cover */}
          <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
            <div className="w-36 h-48 bg-slate-950 rounded-xl shadow-2xl overflow-hidden border border-slate-850 relative group-hover:rotate-1 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-indigo-500/10 opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop"
                className="w-full h-full object-cover"
                alt="Featured Book"
              />
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center text-white space-y-4">
          <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2.5 py-1 rounded-full uppercase tracking-widest w-fit shadow-sm">
            {READING_UI_TEXT.academic.FEATURED_CURRICULUM}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {READING_UI_TEXT.academic.HERO_TITLE}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            {READING_UI_TEXT.academic.HERO_DESC}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button
              className="bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl px-6 py-5 flex items-center gap-2 border-none shadow-sm transition-colors cursor-pointer"
              onClick={() => {
                const specBook = allBooks.find((b) => b.title.includes('Modernist')) || allBooks[0];
                if (specBook) navigate(`/reading/article/${specBook.id}`);
              }}
            >
              <BookOpen className="w-4 h-4" /> {READING_UI_TEXT.academic.READ_NOW}
            </Button>
            <Button
              variant="outline"
              className="border-slate-800 hover:bg-slate-850/60 text-slate-350 hover:text-white font-bold rounded-xl px-6 py-5 flex items-center gap-2"
              onClick={(e) => {
                const specBook = allBooks.find((b) => b.title.includes('Modernist')) || allBooks[0];
                if (specBook) handleToggleBookmark(specBook.id, e);
              }}
            >
              <Bookmark className="w-4 h-4" /> {READING_UI_TEXT.academic.ADD_TO_SHELF}
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Layout (Header & Side split) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-850/60 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {READING_UI_TEXT.academic.TITLE}
          </h1>
          <p className="text-slate-450 dark:text-slate-400 text-xs font-semibold mt-1">
            {READING_UI_TEXT.academic.SUBTITLE}
          </p>
        </div>

        {/* List/Grid Layout Toggle buttons */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850 shrink-0 shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                : 'text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" /> {READING_UI_TEXT.academic.LIST_VIEW}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                : 'text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> {READING_UI_TEXT.academic.GRID_VIEW}
          </button>
        </div>
      </div>

      {/* Main Grid Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column - Book listings (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Skeleton className="w-full h-44 rounded-2xl" />
              <Skeleton className="w-full h-44 rounded-2xl" />
              <Skeleton className="w-full h-44 rounded-2xl" />
              <Skeleton className="w-full h-44 rounded-2xl" />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-8 rounded-2xl shadow-sm">
              <p className="text-red-500 font-bold mb-2">{READING_UI_TEXT.academic.ERROR_LOADING}</p>
              <p className="text-slate-450 text-sm">
                {(error as Error)?.message || READING_UI_TEXT.academic.DEFAULT_ERROR}
              </p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-8 rounded-2xl shadow-sm">
              <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-750 mb-4" />
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
                {READING_UI_TEXT.academic.NO_RESULTS}
              </h3>
              <p className="text-slate-450 dark:text-slate-450 max-w-sm mt-1 text-xs leading-relaxed font-semibold">
                {READING_UI_TEXT.academic.NO_RESULTS_SUB}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCefr([]);
                  setSelectedTags([]);
                  setCefrSliderVal(3);
                }}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-6 py-2 border-none"
              >
                {READING_UI_TEXT.academic.RESET_FILTERS}
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {filteredBooks.map((book) => renderBookCard(book))}
            </div>
          )}
        </div>

        {/* Right column - Filtering & Query */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-105 dark:border-slate-850 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-blue-500" /> {READING_UI_TEXT.academic.REFINE_SEARCH}
            </h4>

            {/* Advanced Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={READING_UI_TEXT.academic.SEARCH_PLACEHOLDER}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 py-4.5 text-xs"
              />
            </div>

            {/* CEFR Difficulty range slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 dark:text-slate-500">
                <span>{READING_UI_TEXT.academic.DIFFICULTY_LEVEL.toUpperCase()}</span>
                <span className="text-blue-500 dark:text-blue-400">{cefrRangeText}</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                value={cefrSliderVal}
                onChange={(e) => setCefrSliderVal(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-extrabold text-slate-400 px-1 pt-1">
                <span>A1</span>
                <span>B1</span>
                <span>C1</span>
                <span>C2</span>
              </div>
            </div>

            {/* Selectable CEFR LEVEL buttons (Mockup 3) */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">
                {READING_UI_TEXT.academic.SELECT_CEFR}
              </span>
              <div className="flex gap-2">
                {['B1', 'B2', 'C1', 'C2'].map((lvl) => {
                  const isSelected = selectedCefr.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      onClick={() => handleToggleCefrButton(lvl)}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer flex-1 text-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discipline tags (Multi-select) */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase block">
                {READING_UI_TEXT.academic.DISCIPLINE_TAGS}
              </span>
              <div className="flex flex-wrap gap-2">
                {ACADEMIC_DATA.DISCIPLINES.map(
                  (discipline) => {
                    const isSelected = selectedTags.includes(discipline.value);
                    return (
                      <button
                        key={discipline.value}
                        onClick={() => handleToggleTag(discipline.value)}
                        className={`text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/80 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-350 dark:hover:border-slate-700'
                        }`}
                      >
                        {discipline.label}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() => {
                    setSelectedTags(ACADEMIC_DATA.DISCIPLINES.map(d => d.value));
                  }}
                  className="text-[10px] font-bold py-1.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-750 text-slate-400 hover:border-slate-400 transition-all cursor-pointer"
                >
                  {READING_UI_TEXT.academic.ADD_FILTER}
                </button>
              </div>
            </div>
          </div>

          {/* Your Reading Progress */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-105 dark:border-slate-850 text-sm">
              <Percent className="w-4 h-4 text-indigo-500" /> {READING_UI_TEXT.academic.YOUR_PROGRESS}
            </h4>

            {isLoading ? (
              Array(2)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : inProgressBooks.length > 0 ? (
              <div className="space-y-4">
                {inProgressBooks.map((book) => {
                  const barColor = book.progress > 50 ? 'bg-blue-500' : 'bg-orange-400';
                  const titleLabel =
                    book.title.length > 20 ? book.title.substring(0, 18) + '...' : book.title;

                  return (
                    <div key={book.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{titleLabel}</span>
                        <span className="text-blue-500 dark:text-blue-400">{book.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-850 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-500`}
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm font-medium text-slate-500">{READING_UI_TEXT.academic.NO_IN_PROGRESS}</p>
              </div>
            )}

            {/* Monthly goal */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-850/60 flex justify-between items-center text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase">
              <span>{READING_UI_TEXT.academic.MONTHLY_GOAL} {READING_UI_TEXT.academic.GOAL_PAGES}</span>
              <span className="text-slate-800 dark:text-slate-200">840 / 1200</span>
            </div>
          </div>

          {/* Community Patterns */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-105 dark:border-slate-850 text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" /> {READING_UI_TEXT.academic.COMMUNITY_PATTERNS}
            </h4>

            <div className="space-y-3">
              {/* Trend 1 */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150/40 dark:border-slate-850 p-3.5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    {READING_UI_TEXT.academic.COMMUNITY_TRENDS.MACRO_TITLE}
                  </h5>
                  <p className="text-[10px] font-bold text-emerald-500 mt-0.5">
                    {READING_UI_TEXT.academic.COMMUNITY_TRENDS.MACRO_SUB}
                  </p>
                </div>
              </div>

              {/* Trend 2 */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150/40 dark:border-slate-850 p-3.5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                  “
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    {READING_UI_TEXT.academic.COMMUNITY_TRENDS.ANNOTATION_TITLE}
                  </h5>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
                    {READING_UI_TEXT.academic.COMMUNITY_TRENDS.ANNOTATION_SUB}
                  </p>
                </div>
              </div>

              {/* Trend 3 */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150/40 dark:border-slate-850 p-3.5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    {READING_UI_TEXT.academic.COMMUNITY_TRENDS.DISCUSSION_TITLE}
                  </h5>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
                    {READING_UI_TEXT.academic.COMMUNITY_TRENDS.DISCUSSION_SUB}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Faculty Reads */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-105 dark:border-slate-850 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> {READING_UI_TEXT.academic.TRENDING_READS}
            </h4>

            {isLoading ? (
              Array(2)
                .fill(0)
                .map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : trendingReads.length > 0 ? (
              <div className="space-y-4">
                {trendingReads.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/reading/article/${book.id}`)}
                    className="flex gap-3 cursor-pointer group"
                  >
                    <div className="w-10 h-14 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-850 shadow-sm group-hover:scale-102 transition-transform">
                      <img
                        src={book.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL;
                        }}
                        className="w-full h-full object-cover"
                        alt={book.title}
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <h5 className="font-extrabold text-xs text-slate-850 dark:text-slate-250 leading-snug line-clamp-2 group-hover:text-blue-500 transition-colors">
                        {book.title}
                      </h5>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                        {book.author}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm font-medium text-slate-500">{READING_UI_TEXT.academic.NO_TRENDING}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  
  );
};
