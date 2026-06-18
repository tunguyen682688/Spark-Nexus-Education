import React from 'react';
import { ArticleCard } from '../components/shared/ArticleCard';
import {
  Input,
  Button,
  Skeleton,
} from '@spark-nest-ed/frontend-shared-components';
import { Search, BookOpen, GraduationCap, Grid, AlertCircle } from 'lucide-react';
import { STUDIO_UI_TEXT } from '../constants/studio-ui-text';
import { CEFR_LEVELS } from '../constants/reading-data';
import { useArticlesContainer } from '../hooks/use-articles-container';

export const ArticlesContainer: React.FC = () => {
  const {
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
  } = useArticlesContainer();

  const levels = CEFR_LEVELS;
  const categories = STUDIO_UI_TEXT.CATEGORIES;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 min-h-screen bg-background font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            Thư viện Bài đọc
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Khám phá các bài đọc phong phú được biên soạn theo tiêu chuẩn CEFR để phát triển từ vựng và ngữ pháp.
          </p>
        </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-white dark:bg-[#121826] rounded-2xl p-4 md:p-6 shadow-sm ring-1 ring-slate-100 dark:ring-white/5 mb-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1 relative shadow-sm rounded-xl overflow-hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài viết theo tiêu đề, từ khóa..."
              className="w-full pl-12 pr-4 py-5 text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800 focus-visible:ring-blue-500"
            />
          </div>
          {/* Reset Filters */}
          {(selectedLevel || selectedCategory || searchTerm) && (
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="px-6 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Level Filters */}
        <div className="space-y-2.5">
          <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Cấp độ CEFR
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLevel('')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                !selectedLevel
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Tất cả
            </button>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedLevel === lvl
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
          <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Grid className="h-3.5 w-3.5" />
            Danh mục chủ đề
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                !selectedCategory
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Tất cả chủ đề
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-[#121826] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 p-4 space-y-4 shadow-sm animate-pulse">
              <Skeleton className="h-44 w-full rounded-xl dark:bg-slate-800" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4 rounded dark:bg-slate-800" />
                <Skeleton className="h-6 w-3/4 rounded dark:bg-slate-800" />
                <Skeleton className="h-10 w-full rounded dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-[#121826] rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center space-y-4 ring-1 ring-slate-100 dark:ring-white/5">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Lỗi tải dữ liệu</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Không thể tải danh sách bài đọc. Vui lòng kiểm tra lại kết nối mạng của bạn.
          </p>
        </div>
      ) : !articles || articles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#121826] rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center space-y-4 ring-1 ring-slate-100 dark:ring-white/5">
          <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 mb-2">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Không tìm thấy bài viết nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Thử điều chỉnh từ khóa tìm kiếm hoặc chọn cấp độ CEFR và danh mục chủ đề khác.
          </p>
          {(selectedLevel || selectedCategory || searchTerm) && (
            <Button
              variant="secondary"
              onClick={handleResetFilters}
              className="mt-2 text-xs font-bold py-2 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-lg"
            >
              Reset bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Loading next page skeletons */}
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-[#121826] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 p-4 space-y-4 shadow-sm animate-pulse">
                  <Skeleton className="h-44 w-full rounded-xl dark:bg-slate-800" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4 rounded dark:bg-slate-800" />
                    <Skeleton className="h-6 w-3/4 rounded dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sentinel element for infinite load detection */}
          <div ref={loadMoreRef} className="h-4 w-full" />
        </div>
      )}
    </div>
  );
};

export default ArticlesContainer;
