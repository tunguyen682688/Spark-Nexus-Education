import React from 'react';
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
  LayoutGrid,
  List,
  Bookmark,
  BookmarkCheck,
  Percent,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DEFAULT_ARTICLE_THUMBNAIL,
  ROUTES,
} from '@spark-nest-ed/frontend-core-constants';
import { ACADEMIC_DATA, READING_UI_TEXT } from '../constants';
import type { Article } from '../types';
import { useBooks } from '../hooks/use-books';

export const BooksContainer: React.FC = () => {
  const navigate = useNavigate();

  const {
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
    dashboardData,
    handleToggleBookmark,
    handleToggleTag,
    handleToggleCefrButton,
  } = useBooks();

  const spotlightBook = React.useMemo(() => {
    if (!allBooks || allBooks.length === 0) return null;
    return (
      allBooks.find((b) => b.tags?.includes('featured') || b.tags?.includes('spotlight')) ||
      allBooks.find((b) => b.category === 'academic') ||
      allBooks[0]
    );
  }, [allBooks]);

  // Render individual book cover card
  const renderBookCard = (book: Article) => {
    const isBookmarked = bookmarkedIds.has(book.id);
    const isCompleted = book.progress >= 100;

    const difficultyLabel =
      book.difficulty === 'C2'
        ? 'C2 MASTERY'
        : book.difficulty === 'C1'
        ? 'C1 ADVANCED'
        : book.difficulty === 'B2'
        ? 'B2 UPPER INT.'
        : `${book.difficulty} INTERMEDIATE`;

    const difficultyColor = book.difficulty.startsWith('C')
      ? book.difficulty === 'C2'
        ? 'bg-red-500/10 text-red-500 border-red-500/20'
        : 'bg-blue-600/10 text-blue-500 border-blue-500/20'
      : 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20';

    if (viewMode === 'list') {
      return (
        <div
          key={book.id}
          onClick={() => navigate(`/reading/article/${book.id}`)}
          className="bg-white dark:bg-[#121826]/80 backdrop-blur-xl border border-slate-100 dark:border-white/5 p-5 rounded-2xl flex items-center justify-between gap-6 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
        >
          <div className="flex items-center gap-5 min-w-0">
            {/* 3D cover container list mode */}
            <div className="w-16 h-20 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-white/5 relative group-hover:scale-[1.05] transition-transform shadow-sm">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-r from-black/25 via-white/5 to-transparent z-10" />
              <div className="absolute top-0 left-2 w-0.5 h-full bg-black/10 z-10" />
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
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-0.5">
                {book.author || READING_UI_TEXT.books.AUTHOR_ANONYMOUS}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  className={`text-[9px] font-bold py-0.5 px-2 rounded-md ${difficultyColor} border`}
                >
                  {difficultyLabel}
                </Badge>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-transparent text-[9px] font-bold py-0.5 px-2 rounded-md uppercase tracking-wider">
                  {book.category === 'academic'
                    ? READING_UI_TEXT.books.TYPE_ACADEMIC
                    : READING_UI_TEXT.books.TYPE_STORY}
                </Badge>
                {book.tags?.[0] && (
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 text-[9px] font-bold py-0.5 px-2 rounded-md uppercase tracking-wider">
                    {book.tags[0]}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right text-xs font-semibold text-slate-450 dark:text-slate-500 space-y-1">
              <p className="flex items-center justify-end gap-1.5 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-3.5 h-3.5" />{' '}
                {Math.ceil(book.wordCount / 200)} {READING_UI_TEXT.academic.PAGES}
              </p>
              <p className="flex items-center justify-end gap-1.5">
                <span className="font-medium text-slate-400 dark:text-slate-500">
                  {READING_UI_TEXT.books.WORD_COUNT_SUFFIX.replace('{count}', book.wordCount.toString())}
                </span>
              </p>
            </div>

            <button
              onClick={(e) => handleToggleBookmark(book.id, e)}
              className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 rounded-xl transition-colors cursor-pointer border border-slate-200/20 dark:border-slate-850"
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
        className="bg-white dark:bg-[#121826]/80 backdrop-blur-xl border border-slate-100 dark:border-white/5 p-3.5 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300 group min-h-[260px]"
      >
        <div className="space-y-3">
          {/* 3D cover container grid mode */}
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 flex shadow-sm group-hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 left-0 w-2.5 h-full bg-gradient-to-r from-black/25 via-white/5 to-transparent z-10" />
            <div className="absolute top-0 left-2.5 w-0.5 h-full bg-black/10 z-10" />
            <img
              src={book.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL;
              }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt={book.title}
            />

            {/* Top cover indicators */}
            <div className="absolute top-2.5 right-2.5 flex gap-1 z-20">
              <Badge className="bg-black/60 text-white font-bold text-[9px] px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                {book.difficulty}
              </Badge>
            </div>

            {/* Reading progress ribbon overlay */}
            {book.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/85 via-black/55 to-transparent z-20 text-white">
                <div className="flex justify-between items-center text-[9px] font-bold mb-1">
                  <span>{READING_UI_TEXT.books.PROGRESS_LABEL}</span>
                  <span
                    className={
                      isCompleted ? 'text-emerald-400' : 'text-amber-400'
                    }
                  >
                    {book.progress}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full ${
                      isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Details */}
          <div className="space-y-1 px-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                {book.category === 'academic' ? READING_UI_TEXT.books.TYPE_ACADEMIC : READING_UI_TEXT.books.TYPE_STORY}
              </span>
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 leading-tight min-h-[36px] group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
              {book.title}
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
              {book.author || READING_UI_TEXT.books.AUTHOR_ANONYMOUS}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 text-[11px] text-slate-400 dark:text-slate-500 font-bold px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-3.5 h-3.5" />{' '}
              {Math.ceil(book.wordCount / 200)} {READING_UI_TEXT.academic.PAGES}
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-400 dark:text-slate-500">
              {READING_UI_TEXT.books.WORD_COUNT_SUFFIX.replace('{count}', book.wordCount.toString())}
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
    <div className="max-w-full mx-auto p-4 md:p-6 bg-background min-h-screen font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate(ROUTES.READING.EXPLORE)}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 transition-colors mb-6 group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        {READING_UI_TEXT.academic.BACK_TO_EXPLORE}
      </button>

      {/* Hero Featured SPOTLIGHT Card */}
      {isLoading ? (
        <div className="mb-8 bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row shadow-lg min-h-[300px] animate-pulse">
          <div className="md:w-1/2 relative min-h-[200px] md:h-auto overflow-hidden bg-slate-800/40" />
          <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center space-y-4">
            <div className="h-4 w-24 rounded bg-slate-800/60" />
            <div className="h-8 w-3/4 rounded bg-slate-800/60" />
            <div className="h-4 w-full rounded bg-slate-800/60" />
            <div className="h-4 w-5/6 rounded bg-slate-800/60" />
          </div>
        </div>
      ) : spotlightBook ? (
        <div className="mb-8 bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row group shadow-lg min-h-[300px]">
          {/* Cover fold backdrop */}
          <div className="md:w-1/2 relative min-h-[200px] md:h-auto overflow-hidden">
            <img
              src={spotlightBook.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL;
              }}
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-102 transition-transform duration-700"
              alt="Curriculum Background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent"></div>
            
            {/* Spotlight Graphic Cover */}
            <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
              <div 
                className="w-36 h-48 bg-slate-950 rounded-xl shadow-2xl overflow-hidden border border-slate-805 relative group-hover:rotate-2 transition-transform duration-500"
                style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
              >
                {/* 3D spine overlay */}
                <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/45 via-black/15 to-transparent z-10" />
                <img
                  src={spotlightBook.thumbnailUrl || DEFAULT_ARTICLE_THUMBNAIL}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_ARTICLE_THUMBNAIL;
                  }}
                  className="w-full h-full object-cover"
                  alt={spotlightBook.title}
                />
              </div>
            </div>
          </div>

          {/* Content Details */}
          <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center text-white space-y-4">
            <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2.5 py-1 rounded-full uppercase tracking-widest w-fit shadow-sm">
              {spotlightBook.category === 'academic' ? READING_UI_TEXT.academic.FEATURED_CURRICULUM : READING_UI_TEXT.books.TYPE_SPOTLIGHT}
            </span>
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight leading-tight line-clamp-2">
              {spotlightBook.title}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl line-clamp-3">
              {spotlightBook.summary || READING_UI_TEXT.books.SUMMARY_FALLBACK}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                className="bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl px-6 py-5 flex items-center gap-2 border-none shadow-sm transition-colors cursor-pointer text-xs h-10"
                onClick={() => {
                  navigate(`/reading/article/${spotlightBook.id}`);
                }}
              >
                <BookOpen className="w-4 h-4" /> {READING_UI_TEXT.academic.READ_NOW}
              </Button>
              <Button
                variant="outline"
                className="border-slate-800 hover:bg-slate-850/60 text-slate-350 hover:text-white font-bold rounded-xl px-6 py-5 flex items-center gap-2 text-xs h-10 transition-colors"
                onClick={(e) => {
                  handleToggleBookmark(spotlightBook.id, e);
                }}
              >
                {bookmarkedIds.has(spotlightBook.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-emerald-400" /> {READING_UI_TEXT.books.SAVED_LABEL}
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" /> {READING_UI_TEXT.academic.ADD_TO_SHELF}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Grid Layout (Header & Side split) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-850/60 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {READING_UI_TEXT.books.TITLE}
          </h1>
          <p className="text-slate-400 dark:text-slate-400 text-xs font-semibold mt-1">
            {READING_UI_TEXT.books.SUBTITLE}
          </p>
        </div>

        {/* List/Grid Layout Toggle buttons */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#121826] p-1 rounded-xl border border-slate-200/50 dark:border-white/5 shrink-0 shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />{' '}
            {READING_UI_TEXT.academic.LIST_VIEW}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />{' '}
            {READING_UI_TEXT.academic.GRID_VIEW}
          </button>
        </div>
      </div>

      {/* Main Grid Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column - Book listings (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#121826] rounded-2xl border border-slate-100 dark:border-white/5 p-3.5 space-y-4 animate-pulse"
                >
                  <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-8 rounded-2xl shadow-sm">
              <p className="text-red-500 font-bold mb-2">
                {READING_UI_TEXT.academic.ERROR_LOADING}
              </p>
              <p className="text-slate-450 text-sm">
                {(error as Error)?.message ||
                  READING_UI_TEXT.academic.DEFAULT_ERROR}
              </p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#121826] border border-slate-200/50 dark:border-white/5 p-8 rounded-2xl shadow-sm">
              <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
                {READING_UI_TEXT.books.NO_BOOKS_TITLE}
              </h3>
              <p className="text-slate-400 dark:text-slate-400 max-w-sm mt-1 text-xs leading-relaxed font-semibold">
                {READING_UI_TEXT.books.NO_BOOKS_DESC}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCefr([]);
                  setSelectedTags([]);
                  setCefrSliderVal(3);
                  setCategoryFilter('all');
                }}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-6 py-2 border-none"
              >
                {READING_UI_TEXT.academic.RESET_FILTERS}
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredBooks.map((book) => renderBookCard(book))}
              </div>

              {/* Skeletons loading next page */}
              {isFetchingNextPage && (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-white/5 animate-pulse'
                      : 'flex flex-col gap-4 pt-6 border-t border-slate-100 dark:border-white/5 animate-pulse'
                  }
                >
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton
                      key={idx}
                      className="w-full h-44 rounded-2xl dark:bg-slate-800"
                    />
                  ))}
                </div>
              )}

              {/* Sentinel observer target */}
              <div ref={loadMoreRef} className="h-4 w-full" />
            </div>
          )}
        </div>

        {/* Right column - Filtering & Query */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#121826] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-blue-500" />{' '}
              {READING_UI_TEXT.academic.REFINE_SEARCH}
            </h4>

            {/* Book category filter selector (Consolidated Book Types selector) */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {READING_UI_TEXT.books.FILTER_TYPE}
              </span>
              <div className="flex gap-2">
                {(
                  [
                    { value: 'all', label: READING_UI_TEXT.books.FILTER_TYPE_ALL },
                    { value: 'academic', label: READING_UI_TEXT.books.FILTER_TYPE_ACADEMIC },
                    { value: 'book', label: READING_UI_TEXT.books.FILTER_TYPE_STORY },
                  ] as { value: 'all' | 'academic' | 'book'; label: string }[]
                ).map((item) => {
                  const isSelected = categoryFilter === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setCategoryFilter(item.value)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex-1 text-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'border-slate-250 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-350'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={READING_UI_TEXT.academic.SEARCH_PLACEHOLDER}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 py-4.5 text-xs focus-visible:ring-blue-500"
              />
            </div>

            {/* CEFR Difficulty range slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 dark:text-slate-500">
                <span>
                  {READING_UI_TEXT.academic.DIFFICULTY_LEVEL.toUpperCase()}
                </span>
                <span className="text-blue-500 dark:text-blue-400">
                  {cefrRangeText}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                value={cefrSliderVal}
                onChange={(e) => setCefrSliderVal(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] font-extrabold text-slate-450 px-1 pt-1">
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
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-350 dark:hover:border-slate-700'
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
                {ACADEMIC_DATA.DISCIPLINES.map((discipline) => {
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
                })}
                <button
                  onClick={() => {
                    setSelectedTags(
                      ACADEMIC_DATA.DISCIPLINES.map((d) => d.value)
                    );
                  }}
                  className="text-[10px] font-bold py-1.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-750 text-slate-400 hover:border-slate-400 transition-all cursor-pointer"
                >
                  {READING_UI_TEXT.academic.ADD_FILTER}
                </button>
              </div>
            </div>
          </div>

          {/* Your Reading Progress */}
          <div className="bg-white dark:bg-[#121826] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5 text-sm">
              <Percent className="w-4 h-4 text-indigo-500" />{' '}
              {READING_UI_TEXT.academic.YOUR_PROGRESS}
            </h4>

            {isLoading ? (
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full animate-pulse" />
                ))
            ) : inProgressBooks.length > 0 ? (
              <div className="space-y-4">
                {inProgressBooks.map((book) => {
                  const barColor =
                    book.progress > 50 ? 'bg-blue-500' : 'bg-orange-400';
                  const titleLabel =
                    book.title.length > 20
                      ? book.title.substring(0, 18) + '...'
                      : book.title;

                  return (
                    <div key={book.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800 dark:text-slate-200">
                          {titleLabel}
                        </span>
                        <span className="text-blue-500 dark:text-blue-400">
                          {book.progress}%
                        </span>
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
                <p className="text-sm font-medium text-slate-500">
                  {READING_UI_TEXT.academic.NO_IN_PROGRESS}
                </p>
              </div>
            )}

            {/* Real stats from user reading history */}
            {dashboardData?.stats && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span>{READING_UI_TEXT.books.STAT_WORDS_LEARNED}</span>
                  <span className="text-slate-855 dark:text-slate-200 font-extrabold font-mono">
                    {READING_UI_TEXT.books.STAT_WORDS_VAL.replace('{count}', dashboardData.stats.wordsLookedUp.toString())}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span>{READING_UI_TEXT.books.STAT_DOCS_COMPLETED}</span>
                  <span className="text-slate-855 dark:text-slate-200 font-extrabold font-mono">
                    {READING_UI_TEXT.books.STAT_DOCS_VAL.replace('{count}', dashboardData.stats.totalArticles.toString())}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span>{READING_UI_TEXT.books.STAT_AVG_SPEED}</span>
                  <span className="text-slate-855 dark:text-slate-200 font-extrabold font-mono text-blue-500 dark:text-blue-400">
                    {dashboardData.stats.avgWpm} WPM
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BooksContainer;
